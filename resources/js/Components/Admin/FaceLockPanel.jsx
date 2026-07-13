import { issueFaceEnrollLink, revokeFaceLock } from '@/lib/admin-api';
import { useState } from 'react';

export default function FaceLockPanel({ user, onUserChange }) {
    const [hours, setHours] = useState(24);
    const [enrollUrl, setEnrollUrl] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    if (!user?.uid) {
        return null;
    }

    async function handleGenerateLink() {
        setBusy(true);
        setError(null);
        setMessage(null);

        try {
            const data = await issueFaceEnrollLink(user.uid, hours);
            setEnrollUrl(data.url);
            setExpiresAt(data.expiresAt);
            onUserChange?.(data.user);
            setMessage('Enrollment link generated. Copy and send it to the user.');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function handleCopyLink() {
        if (!enrollUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(enrollUrl);
            setMessage('Link copied to clipboard.');
            setError(null);
        } catch {
            setError('Could not copy automatically. Select and copy the link below.');
        }
    }

    async function handleRevoke() {
        if (!confirm('Remove face lock for this user? They will need a new enrollment link to sign in with face scan.')) {
            return;
        }

        setBusy(true);
        setError(null);
        setMessage(null);

        try {
            const data = await revokeFaceLock(user.uid);
            setEnrollUrl('');
            setExpiresAt('');
            onUserChange?.(data.user);
            setMessage('Face lock removed.');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="card-surface space-y-4 p-6">
            <div>
                <h2 className="text-lg font-medium">Face lock</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Members register Face Lock under Profile → Face Lock after they can sign in.
                    Admins can revoke a registered face below.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-400">Status:</span>
                {user.hasFaceRegistered ? (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-300">
                        Enrolled
                        {user.faceRegisteredAt ? ` · ${new Date(user.faceRegisteredAt).toLocaleString()}` : ''}
                    </span>
                ) : (
                    <span className="rounded-full bg-slate-500/20 px-2.5 py-0.5 text-slate-300">Not enrolled</span>
                )}
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {message && <p className="text-sm text-emerald-300">{message}</p>}

            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="label-dark">Link validity (hours)</label>
                    <input
                        className="input-dark w-28"
                        type="number"
                        min="1"
                        max="168"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                    />
                </div>
                <button type="button" className="btn-primary" disabled={busy} onClick={handleGenerateLink}>
                    {busy ? 'Working…' : user.hasFaceRegistered ? 'Generate re-enroll link' : 'Generate enrollment link'}
                </button>
                {enrollUrl && (
                    <button type="button" className="btn-secondary" disabled={busy} onClick={handleCopyLink}>
                        Copy link
                    </button>
                )}
                {user.hasFaceRegistered && (
                    <button type="button" className="btn-secondary text-red-300" disabled={busy} onClick={handleRevoke}>
                        Remove face lock
                    </button>
                )}
            </div>

            {enrollUrl && (
                <div>
                    <label className="label-dark">Enrollment URL</label>
                    <textarea className="input-dark min-h-24 w-full font-mono text-xs" readOnly value={enrollUrl} />
                    {expiresAt && (
                        <p className="mt-2 text-xs text-slate-500">Expires {new Date(expiresAt).toLocaleString()}</p>
                    )}
                </div>
            )}
        </section>
    );
}
