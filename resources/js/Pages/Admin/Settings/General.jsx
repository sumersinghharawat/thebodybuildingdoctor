import AdminShell from '@/Components/Admin/AdminShell';
import { fetchGeneralSettings, updateGeneralSettings } from '@/lib/admin-api';
import { formatPrice, setSiteCurrency } from '@/lib/format';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GeneralSettingsAdmin() {
    const [currency, setCurrency] = useState('EUR');
    const [supportedCurrencies, setSupportedCurrencies] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchGeneralSettings()
            .then((settings) => {
                setCurrency(settings.currency);
                setSupportedCurrencies(settings.supportedCurrencies || {});
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
            const settings = await updateGeneralSettings({ currency });
            setCurrency(settings.currency);
            setSupportedCurrencies(settings.supportedCurrencies || {});
            setSiteCurrency(settings.currency);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title="General settings">
            <Head title="General settings" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <form onSubmit={handleSubmit} className="card-surface max-w-2xl space-y-6 p-6">
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    {success && (
                        <p className="text-sm text-emerald-300">
                            Settings saved. Course prices across the site will use the selected currency.
                        </p>
                    )}

                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">Course pricing</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Choose the currency shown for course prices on the landing page, courses page, and admin.
                        </p>
                    </div>

                    <div>
                        <label className="label-dark" htmlFor="currency">
                            Currency
                        </label>
                        <select
                            id="currency"
                            className="input-dark"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {Object.entries(supportedCurrencies).map(([code, label]) => (
                                <option key={code} value={code}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs text-slate-500">
                            Preview: {formatPrice(9900, currency)} · {formatPrice(0, currency)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Course prices are still stored in cents. Example: enter 9900 for {formatPrice(9900, currency)}.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Save settings'}
                        </button>
                        <Link href={route('admin.courses.index')} className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
