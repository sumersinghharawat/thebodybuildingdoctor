import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { usePasskeyRegister } from '@laravel/passkeys/react';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

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
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Unable to remove passkey.');
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
            <header>
                <h2 className="text-lg font-medium text-gray-900">Face login</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Register Face ID, Touch ID, or another device passkey for faster sign-in.
                </p>
            </header>

            {!isSupported ? (
                <p className="mt-4 text-sm text-gray-500">
                    Passkeys are not supported in this browser. Use a modern browser on a secure connection.
                </p>
            ) : (
                <div className="mt-6 space-y-4">
                    <div>
                        <InputLabel htmlFor="passkey-name" value="Device name" />
                        <input
                            id="passkey-name"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            placeholder="e.g. MacBook Pro, iPhone"
                        />
                    </div>

                    <PrimaryButton
                        type="button"
                        disabled={isLoading || !deviceName.trim()}
                        onClick={() => register(deviceName.trim())}
                    >
                        {isLoading ? 'Registering…' : 'Add passkey'}
                    </PrimaryButton>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {removeError && <p className="text-sm text-red-600">{removeError}</p>}

                    <p className="text-xs text-gray-500">
                        You may be asked to confirm your password before adding or removing a passkey.{' '}
                        <Link href={route('password.confirm')} className="underline">
                            Confirm password
                        </Link>
                    </p>
                </div>
            )}

            {items.length > 0 && (
                <ul className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200">
                    {items.map((passkey) => (
                        <li key={passkey.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{passkey.name}</p>
                                <p className="text-xs text-gray-500">
                                    {passkey.authenticator ? `${passkey.authenticator} · ` : ''}
                                    Added {new Date(passkey.createdAt).toLocaleDateString()}
                                    {passkey.lastUsedAt
                                        ? ` · Last used ${new Date(passkey.lastUsedAt).toLocaleDateString()}`
                                        : ''}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="text-sm text-red-600 hover:underline disabled:opacity-50"
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
