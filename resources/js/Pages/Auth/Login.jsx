import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [passkeyHint, setPasskeyHint] = useState(null);

    const {
        verify: loginWithPasskey,
        isLoading: passkeyLoading,
        error: passkeyError,
        isSupported: passkeySupported,
    } = usePasskeyVerify({
        onSuccess: (response) => {
            router.visit(response.redirect || route('dashboard'));
        },
        onError: (err) => {
            if (err.message?.includes("can't be used on")) {
                setPasskeyHint('Passkeys require http://localhost:8000 in local development (not 127.0.0.1).');
                return;
            }

            if (err.name === 'UserCancelledError') {
                return;
            }

            setPasskeyHint(
                'No passkey found for this site. Sign in with your password, then add a passkey from your profile page.',
            );
        },
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-semibold">Member login</h1>
                <p className="mt-1 text-sm text-slate-400">Sign in to access courses and mentorship.</p>
            </div>

            {status && <div className="mb-4 text-sm font-medium text-emerald-400">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-300" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="input-dark mt-1"
                        autoComplete="username webauthn"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="input-dark mt-1"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-400">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    Remember me
                </label>

                <div className="flex flex-col gap-3 pt-2">
                    <PrimaryButton className="btn-primary w-full justify-center" disabled={processing}>
                        Sign in
                    </PrimaryButton>

                    {passkeySupported && (
                        <>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="h-px flex-1 bg-slate-700" />
                                or
                                <span className="h-px flex-1 bg-slate-700" />
                            </div>
                            <button
                                type="button"
                                className="btn-secondary w-full justify-center"
                                disabled={passkeyLoading || processing}
                                onClick={loginWithPasskey}
                            >
                                {passkeyLoading ? 'Verifying…' : 'Sign in with face lock'}
                            </button>
                            {passkeyError && <p className="text-center text-sm text-red-400">{passkeyError}</p>}
                            {passkeyHint && <p className="text-center text-sm text-amber-400">{passkeyHint}</p>}
                        </>
                    )}

                    {canResetPassword && (
                        <Link href={route('password.request')} className="text-center text-sm text-slate-400 underline hover:text-white">
                            Forgot password?
                        </Link>
                    )}
                    <p className="text-center text-xs text-slate-500">
                        New accounts are created by your administrator. Add a passkey from your profile after signing in.
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
