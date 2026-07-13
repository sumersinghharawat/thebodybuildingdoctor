import FaceStatus from '@/Components/Face/FaceStatus';
import FaceWebcam from '@/Components/Face/FaceWebcam';
import PrimaryButton from '@/Components/PrimaryButton';
import { capturePoseSamples, useFaceApi } from '@/hooks/useFaceApi';
import { useCallback, useRef, useState } from 'react';

export default function FaceLockForm({ hasFaceRegistered, faceRegisteredAt, faceConfig }) {
    const webcamRef = useRef(null);
    const { ready, loading, error: modelError } = useFaceApi(faceConfig.modelsPath);
    const [registered, setRegistered] = useState(Boolean(hasFaceRegistered));
    const [cameraError, setCameraError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const [tone, setTone] = useState('info');

    const getVideo = useCallback(() => webcamRef.current?.getVideo() ?? null, []);

    const submitSamples = async (method) => {
        setBusy(true);
        setMessage(null);

        try {
            const video = getVideo();
            if (!video) {
                throw new Error('Camera is not ready.');
            }

            setTone('loading');
            setMessage('Follow the prompts: front, left, then right.');

            const samples = await capturePoseSamples(getVideo, (_pose, hint) => {
                setTone('loading');
                setMessage(hint);
            });

            const url = method === 'put' ? route('face.update') : route('face.register');
            const response = await window.axios({
                method,
                url,
                data: { samples },
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Unable to save Face Lock.');
            }

            setRegistered(true);
            setTone('success');
            setMessage(response.data.message || 'Face Lock saved.');
        } catch (err) {
            setTone('error');
            setMessage(err.response?.data?.message || err.message || 'Face Lock failed.');
        } finally {
            setBusy(false);
        }
    };

    const removeFace = async () => {
        if (!window.confirm('Remove Face Lock from this account?')) {
            return;
        }

        setBusy(true);
        setMessage(null);

        try {
            const response = await window.axios.delete(route('face.delete'));
            setRegistered(false);
            setTone('success');
            setMessage(response.data?.message || 'Face Lock removed.');
        } catch (err) {
            setTone('error');
            setMessage(err.response?.data?.message || err.message || 'Unable to remove Face Lock.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <section className="space-y-4">
            <header>
                <h2 className="text-lg font-semibold text-slate-100">Face Lock</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Register with three poses: front, left, and right. No eye blink required.
                    Only an encrypted descriptor is stored — never a photo.
                </p>
            </header>

            {registered ? (
                <FaceStatus tone="success">
                    Face Lock is active
                    {faceRegisteredAt ? ` (since ${new Date(faceRegisteredAt).toLocaleString()})` : ''}.
                </FaceStatus>
            ) : (
                <FaceStatus tone="warning">Face Lock is not registered yet.</FaceStatus>
            )}

            <FaceWebcam
                ref={webcamRef}
                onUserMediaError={() =>
                    setCameraError('Camera permission denied. Allow camera access to enroll.')
                }
            />

            {(loading || !ready) && !modelError && (
                <FaceStatus tone="loading">Loading face recognition models…</FaceStatus>
            )}
            {modelError && <FaceStatus tone="error">{modelError}</FaceStatus>}
            {cameraError && <FaceStatus tone="error">{cameraError}</FaceStatus>}
            {message && <FaceStatus tone={tone}>{message}</FaceStatus>}

            <div className="flex flex-wrap gap-3">
                {!registered ? (
                    <PrimaryButton
                        type="button"
                        disabled={!ready || busy || Boolean(cameraError)}
                        onClick={() => submitSamples('post')}
                    >
                        {busy ? 'Capturing poses…' : 'Register Face'}
                    </PrimaryButton>
                ) : (
                    <>
                        <PrimaryButton
                            type="button"
                            disabled={!ready || busy || Boolean(cameraError)}
                            onClick={() => submitSamples('put')}
                        >
                            {busy ? 'Capturing poses…' : 'Update Face'}
                        </PrimaryButton>
                        <button
                            type="button"
                            className="rounded-md border border-rose-700 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-950/40 disabled:opacity-50"
                            disabled={busy}
                            onClick={removeFace}
                        >
                            Remove Face
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}
