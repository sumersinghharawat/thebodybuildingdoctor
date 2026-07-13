import FaceLivenessChallenge from '@/Components/Face/FaceLivenessChallenge';
import FaceStatus from '@/Components/Face/FaceStatus';
import FaceWebcam from '@/Components/Face/FaceWebcam';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { useFaceApi, useLivenessChallenge } from '@/hooks/useFaceApi';
import { detectSingleFace } from '@/lib/face-api-loader';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';

export default function Login({ config, livenessAction, status, error: pageError }) {
    const webcamRef = useRef(null);
    const { ready, loading, error: modelError } = useFaceApi(config.modelsPath);
    const getVideo = useCallback(() => webcamRef.current?.getVideo() ?? null, []);

    const liveness = useLivenessChallenge(getVideo, livenessAction, {
        enabled: ready,
        modelsReady: ready,
    });

    const [cameraError, setCameraError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(pageError || null);
    const [tone, setTone] = useState(pageError ? 'error' : 'info');
    const [showPassword, setShowPassword] = useState(false);

    const passwordForm = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleLogin = async () => {
        setMessage(null);
        setSubmitting(true);

        try {
            if (!liveness.passed) {
                throw new Error('Complete the liveness challenge first.');
            }

            const video = getVideo();
            if (!video) {
                throw new Error('Camera is not ready.');
            }

            const result = await detectSingleFace(video, { retries: 5, delayMs: 300 });

            if (result.error === 'no_face') {
                throw new Error(
                    'Face not found. Sit closer, face the camera with good lighting, then try again.',
                );
            }

            if (result.error === 'multiple_faces') {
                throw new Error('Multiple faces detected. Only one person can be in frame.');
            }

            const response = await window.axios.post(route('face.login.store'), {
                descriptor: result.descriptor,
                liveness_action: livenessAction,
                liveness_passed: true,
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Face login failed.');
            }

            setTone('success');
            setMessage(response.data.message || 'Success. Redirecting…');
            router.visit(response.data.redirect || route('dashboard'));
        } catch (err) {
            const apiMessage = err.response?.data?.message || err.message || 'Face login failed.';
            setTone('error');
            setMessage(apiMessage);
            liveness.reset();
        } finally {
            setSubmitting(false);
        }
    };

    const submitPassword = (event) => {
        event.preventDefault();
        passwordForm.post('/login', {
            onFinish: () => passwordForm.reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Face Login" />

            <div className="mb-5 text-center">
                <h1 className="text-xl font-semibold text-slate-100">Face Login</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Sign in with Face Lock. First time? Use email/password to register your face.
                </p>
            </div>

            {status && <FaceStatus tone="success">{status}</FaceStatus>}

            <div className="space-y-4">
                <FaceWebcam
                    ref={webcamRef}
                    onUserMediaError={() =>
                        setCameraError('Camera permission denied. Allow camera access and refresh.')
                    }
                />

                {(loading || !ready) && !modelError && (
                    <FaceStatus tone="loading">Loading face recognition models…</FaceStatus>
                )}

                {modelError && <FaceStatus tone="error">{modelError}</FaceStatus>}
                {cameraError && <FaceStatus tone="error">{cameraError}</FaceStatus>}

                {ready && !cameraError && (
                    <FaceLivenessChallenge
                        label={liveness.label}
                        hint={liveness.hint}
                        passed={liveness.passed}
                        status={liveness.status}
                    />
                )}

                {message && <FaceStatus tone={tone}>{message}</FaceStatus>}

                <PrimaryButton
                    type="button"
                    className="w-full justify-center"
                    disabled={!ready || !liveness.passed || submitting || Boolean(cameraError)}
                    onClick={handleLogin}
                >
                    {submitting ? 'Verifying…' : 'Login with Face'}
                </PrimaryButton>

                <button
                    type="button"
                    className="w-full text-sm text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
                    onClick={() => {
                        setMessage(null);
                        liveness.reset();
                    }}
                >
                    Retry challenge
                </button>

                <div className="border-t border-slate-800 pt-4">
                    <button
                        type="button"
                        className="w-full text-sm font-medium text-slate-300 underline-offset-2 hover:underline"
                        onClick={() => setShowPassword((value) => !value)}
                    >
                        {showPassword
                            ? 'Hide email/password sign-in'
                            : 'First time? Sign in with email to set up Face Lock'}
                    </button>

                    {showPassword && (
                        <form onSubmit={submitPassword} className="mt-4 space-y-3">
                            <div>
                                <InputLabel htmlFor="email" value="Email" className="text-slate-300" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={passwordForm.data.email}
                                    className="input-dark mt-1 w-full"
                                    autoComplete="username"
                                    onChange={(e) => passwordForm.setData('email', e.target.value)}
                                />
                                <InputError message={passwordForm.errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={passwordForm.data.password}
                                    className="input-dark mt-1 w-full"
                                    autoComplete="current-password"
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                />
                                <InputError message={passwordForm.errors.password} className="mt-2" />
                            </div>

                            <PrimaryButton
                                type="submit"
                                className="w-full justify-center"
                                disabled={passwordForm.processing}
                            >
                                {passwordForm.processing ? 'Signing in…' : 'Sign in with email'}
                            </PrimaryButton>

                            <p className="text-center text-xs text-slate-500">
                                After signing in, open Profile → Face Lock to register your face.
                            </p>
                        </form>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500">
                    Admins:{' '}
                    <Link href="/admin/login" className="text-slate-300 underline-offset-2 hover:underline">
                        /admin/login
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
