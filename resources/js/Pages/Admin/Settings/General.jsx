import AdminShell from '@/Components/Admin/AdminShell';
import { fetchGeneralSettings, updateGeneralSettings, uploadThumbnail } from '@/lib/admin-api';
import { formatPrice, setSiteCurrency } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GeneralSettingsAdmin() {
    const [notificationEmail, setNotificationEmail] = useState('');
    const [paymentQrUrl, setPaymentQrUrl] = useState('');
    const [paymentInstructions, setPaymentInstructions] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchGeneralSettings()
            .then((settings) => {
                setNotificationEmail(settings.notificationEmail || '');
                setPaymentQrUrl(settings.paymentQrUrl || '');
                setPaymentInstructions(settings.paymentInstructions || '');
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const settings = await updateGeneralSettings({
                currency: 'INR',
                notificationEmail,
                paymentQrUrl,
                paymentInstructions,
            });
            setNotificationEmail(settings.notificationEmail || '');
            setPaymentQrUrl(settings.paymentQrUrl || '');
            setPaymentInstructions(settings.paymentInstructions || '');
            setSiteCurrency('INR');
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleQrUpload(file) {
        setUploading(true);
        setError(null);
        try {
            const { url } = await uploadThumbnail(file, 'marketing');
            setPaymentQrUrl(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <AdminShell title="General settings">
            <Head title="General settings" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <form onSubmit={handleSubmit} className="card-surface max-w-2xl space-y-6 p-6">
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    {success && (
                        <p className="text-sm text-emerald-300">
                            Settings saved. Course/book prices and payment QR are updated across the site.
                        </p>
                    )}

                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                        <p className="mt-1 text-sm text-muted">
                            Access requests are saved in Inquiries and emailed to this address.
                        </p>
                    </div>

                    <div>
                        <label className="label-dark" htmlFor="notificationEmail">
                            Admin notification email
                        </label>
                        <input
                            id="notificationEmail"
                            type="email"
                            className="input-dark"
                            placeholder="admin@example.com"
                            value={notificationEmail}
                            onChange={(e) => setNotificationEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Book payment QR</h2>
                        <p className="mt-1 text-sm text-muted">
                            Members scan this QR to pay for books. After payment they request access, then you approve
                            under Book access.
                        </p>
                    </div>

                    <div>
                        <label className="label-dark">Payment QR image</label>
                        <input
                            className="input-dark"
                            value={paymentQrUrl}
                            onChange={(e) => setPaymentQrUrl(e.target.value)}
                            placeholder="Upload or paste image URL"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-2 text-sm"
                            disabled={uploading}
                            onChange={(e) => e.target.files?.[0] && handleQrUpload(e.target.files[0])}
                        />
                        {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
                        {paymentQrUrl ? (
                            <img
                                src={paymentQrUrl}
                                alt="Payment QR preview"
                                className="mt-3 h-40 w-40 rounded-lg border border-edge bg-white object-contain p-2"
                            />
                        ) : null}
                    </div>

                    <div>
                        <label className="label-dark" htmlFor="paymentInstructions">
                            Payment instructions
                        </label>
                        <textarea
                            id="paymentInstructions"
                            className="input-dark min-h-[6rem]"
                            value={paymentInstructions}
                            onChange={(e) => setPaymentInstructions(e.target.value)}
                            placeholder="e.g. Scan QR with your banking app, then tap “I have paid” on the book page."
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Pricing currency</h2>
                        <p className="mt-1 text-sm text-muted">
                            All prices on the site are shown in Indian Rupees (₹) only.
                        </p>
                        <p className="mt-2 text-xs text-faint">
                            Preview: {formatPrice(9900, 'INR')} · {formatPrice(0, 'INR')}
                        </p>
                        <p className="mt-1 text-xs text-faint">
                            Enter prices in paise/cents. Example: 9900 = {formatPrice(9900, 'INR')}.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Save settings'}
                        </button>
                        <Link href={route('admin.books.index')} className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
