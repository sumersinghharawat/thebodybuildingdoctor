import { useCallback, useEffect, useRef, useState } from 'react';
import {
    detectSingleFace,
    estimateHeadYaw,
    loadFaceModels,
    LIVENESS_LABELS,
    poseMatches,
    ENROLLMENT_POSES,
} from '@/lib/face-api-loader';

/**
 * Load face-api models once per page and expose detection helpers.
 */
export function useFaceApi(modelsPath = '/models') {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        setLoading(true);
        loadFaceModels(modelsPath)
            .then(() => {
                if (!cancelled) {
                    setReady(true);
                    setError(null);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message || 'Failed to load face models.');
                    setReady(false);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [modelsPath]);

    return { ready, loading, error };
}

/**
 * Watch a video element for a head-pose liveness challenge (front / left / right).
 * @param {() => HTMLVideoElement|null} getVideo
 */
export function useLivenessChallenge(getVideo, action, { enabled = true, modelsReady = false } = {}) {
    const [passed, setPassed] = useState(false);
    const [hint, setHint] = useState(LIVENESS_LABELS[action] || 'Complete the challenge');
    const [status, setStatus] = useState('waiting');
    const holdRef = useRef({ frames: 0 });

    useEffect(() => {
        setPassed(false);
        setStatus('waiting');
        setHint(LIVENESS_LABELS[action] || 'Complete the challenge');
        holdRef.current = { frames: 0 };
    }, [action]);

    useEffect(() => {
        if (!enabled || !modelsReady || passed || !action) {
            return undefined;
        }

        let cancelled = false;
        let timer = null;

        const tick = async () => {
            const video = typeof getVideo === 'function' ? getVideo() : getVideo?.current;
            if (!video || video.readyState < 2) {
                timer = window.setTimeout(tick, 250);
                return;
            }

            try {
                const result = await detectSingleFace(video, { retries: 1, delayMs: 0 });

                if (cancelled) {
                    return;
                }

                if (result.error === 'no_face') {
                    holdRef.current.frames = 0;
                    setStatus('no_face');
                    setHint('Center your face in the camera');
                } else if (result.error === 'multiple_faces') {
                    holdRef.current.frames = 0;
                    setStatus('multiple_faces');
                    setHint('Only one face should be in frame');
                } else {
                    const yaw = estimateHeadYaw(result.landmarks);
                    setHint(LIVENESS_LABELS[action] || 'Hold the pose');
                    setStatus('waiting');

                    if (poseMatches(action, yaw)) {
                        holdRef.current.frames += 1;
                        // Require a short hold so a quick flicker does not count.
                        if (holdRef.current.frames >= 3) {
                            setPassed(true);
                            setStatus('passed');
                            setHint(
                                action === 'front'
                                    ? 'Front face verified'
                                    : action === 'left'
                                        ? 'Left face verified'
                                        : 'Right face verified',
                            );
                        }
                    } else {
                        holdRef.current.frames = 0;
                    }
                }
            } catch {
                // Keep polling.
            }

            if (!cancelled) {
                timer = window.setTimeout(tick, 280);
            }
        };

        tick();

        return () => {
            cancelled = true;
            if (timer) {
                window.clearTimeout(timer);
            }
        };
    }, [action, enabled, getVideo, modelsReady, passed]);

    const reset = useCallback(() => {
        setPassed(false);
        setStatus('waiting');
        setHint(LIVENESS_LABELS[action] || 'Complete the challenge');
        holdRef.current = { frames: 0 };
    }, [action]);

    return { passed, hint, status, reset, label: LIVENESS_LABELS[action] };
}

/**
 * Capture front, left, then right face samples (guided poses).
 */
export async function capturePoseSamples(getVideo, onProgress) {
    const samples = [];

    for (const pose of ENROLLMENT_POSES) {
        onProgress?.(pose, LIVENESS_LABELS[pose]);

        let captured = null;
        const started = Date.now();

        while (!captured) {
            if (Date.now() - started > 45000) {
                throw new Error(`Timed out waiting for ${LIVENESS_LABELS[pose]}. Try again.`);
            }

            const video = typeof getVideo === 'function' ? getVideo() : getVideo;
            if (!video || video.readyState < 2) {
                await new Promise((resolve) => window.setTimeout(resolve, 250));
                continue;
            }

            const result = await detectSingleFace(video, { retries: 2, delayMs: 200 });

            if (result.error === 'multiple_faces') {
                onProgress?.(pose, 'Only one face should be in frame');
                await new Promise((resolve) => window.setTimeout(resolve, 300));
                continue;
            }

            if (result.error === 'no_face' || !result.landmarks) {
                onProgress?.(pose, 'Center your face, then: ' + LIVENESS_LABELS[pose]);
                await new Promise((resolve) => window.setTimeout(resolve, 300));
                continue;
            }

            const yaw = estimateHeadYaw(result.landmarks);

            if (!poseMatches(pose, yaw)) {
                onProgress?.(pose, LIVENESS_LABELS[pose]);
                await new Promise((resolve) => window.setTimeout(resolve, 280));
                continue;
            }

            // Hold pose briefly, then capture.
            await new Promise((resolve) => window.setTimeout(resolve, 450));
            const confirm = await detectSingleFace(video, { retries: 3, delayMs: 200 });

            if (
                confirm.error
                || !confirm.landmarks
                || !poseMatches(pose, estimateHeadYaw(confirm.landmarks))
            ) {
                continue;
            }

            captured = confirm.descriptor;
            samples.push(captured);
            onProgress?.(pose, `${LIVENESS_LABELS[pose]} — captured`);
            await new Promise((resolve) => window.setTimeout(resolve, 400));
        }
    }

    return samples;
}
