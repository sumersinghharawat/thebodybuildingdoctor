import { getCsrfToken } from '@/lib/csrf';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function ManagePasskeysForm({ passkeys = [], className = '' }) {
    const [deviceName, setDeviceName] = useState('');
    const [items, setItems] = useState(passkeys);
    const [removingId, setRemovingId] = useState(null);
    const [removeError, setRemoveError] = useState(null);

    useEffect(() => {
        setItems(passkeys);
    }, [passkeys]);

    const { register, isLoading, error, isSupported } = usePasskeyRegister({
        onSuccess: () => {
            router.reload({ only: ['passkeys'] });
            setDeviceName('');
        },
        onError: (err) => {
            if (err.message?.includes("can't be used on")) {
                setRemoveError('Use http://localhost:8000 instead of 127.0.0.1 for face lock login in local development.');
            }
        },
    });

    async function handleRemove(passkeyId) {
        setRemovingId(passkeyId);
        setRemoveError(null);

        try {
            const res = await fetch(`/user/passkeys/${passkeyId}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Unable to remove face lock login.');
            }

            setItems((current) => current.filter((item) => item.id !== passkeyId));
        } catch (err) {
            setRemoveError(err.message);
        } finally {
            setRemovingId(null);
        }
    }

    return (
        <section className={className}>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold">Face lock login</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Sign in with Face ID, Touch ID, or your device passkey instead of typing your password.
                    </p>
                </div>
                {items.length > 0 && (
                    <span className="pill border-emerald-800/60 bg-emerald-950/40 text-emerald-300">
                        Enabled
                    </span>
                )}
            </header>

            {!isSupported ? (
                <p className="mt-4 text-sm text-slate-500">
                    Face lock login is not supported in this browser. Use a modern browser on a secure connection (HTTPS).
                </p>
            ) : (
                <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                        <p className="text-sm text-slate-300">
                            {items.length === 0
                                ? 'No face lock set up yet. Add this device to enable quick sign-in.'
                                : 'Add another device if you sign in from multiple phones or computers.'}
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                            <div>
                                <label htmlFor="passkey-name" className="label-dark">
                                    Device name
                                </label>
                                <input
                                    id="passkey-name"
                                    className="input-dark"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    placeholder="e.g. iPhone, MacBook Pro"
                                />
                            </div>

                            <button
                                type="button"
                                className="btn-primary whitespace-nowrap"
                                disabled={isLoading || !deviceName.trim()}
                                onClick={() => register(deviceName.trim())}
                            >
                                {isLoading ? 'Setting up…' : 'Enable face lock login'}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {removeError && <p className="text-sm text-red-400">{removeError}</p>}

                    <p className="text-xs text-slate-500">
                        After enabling, use &ldquo;Sign in with Face ID / passkey&rdquo; on the login page.
                    </p>
                </div>
            )}

            {items.length > 0 && (
                <ul className="mt-6 divide-y divide-slate-800 rounded-lg border border-slate-800">
                    {items.map((passkey) => (
                        <li key={passkey.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-slate-100">{passkey.name}</p>
                                <p className="text-xs text-slate-500">
                                    {passkey.authenticator ? `${passkey.authenticator} · ` : ''}
                                    Added {new Date(passkey.createdAt).toLocaleDateString()}
                                    {passkey.lastUsedAt
                                        ? ` · Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`
                                        : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                                disabled={removingId === passkey.id}
                                onClick={() => handleRemove(passkey.id)}
                            >
                                {removingId === passkey.id ? 'Removing…' : 'Remove'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
