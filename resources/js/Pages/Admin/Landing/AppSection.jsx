import AdminShell from '@/Components/Admin/AdminShell';
import { fetchLandingAppSection, updateLandingAppSection, uploadThumbnail } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const emptyForm = {
    enabled: true,
    eyebrow: '',
    title: '',
    description: '',
    features: [''],
    playStoreUrl: '',
    buttonLabel: '',
    comingSoonLabel: '',
    screenshotUrl: '',
    mockupLabel: '',
};

export default function LandingAppSectionAdmin() {
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchLandingAppSection()
            .then((appSection) => {
                setForm({
                    enabled: appSection.enabled,
                    eyebrow: appSection.eyebrow,
                    title: appSection.title,
                    description: appSection.description,
                    features: appSection.features?.length ? appSection.features : [''],
                    playStoreUrl: appSection.playStoreUrl || '',
                    buttonLabel: appSection.buttonLabel,
                    comingSoonLabel: appSection.comingSoonLabel,
                    screenshotUrl: appSection.screenshotUrl || '',
                    mockupLabel: appSection.mockupLabel || '',
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateFeature(index, value) {
        setForm((prev) => ({
            ...prev,
            features: prev.features.map((feature, i) => (i === index ? value : feature)),
        }));
    }

    function addFeature() {
        setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
    }

    function removeFeature(index) {
        setForm((prev) => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    }

    async function handleScreenshot(file) {
        setUploading(true);
        setError(null);
        setSuccess(false);
        try {
            const { url } = await uploadThumbnail(file, 'marketing');
            const nextForm = { ...form, screenshotUrl: url };
            setForm(nextForm);
            await updateLandingAppSection({
                ...nextForm,
                features: nextForm.features.map((feature) => feature.trim()).filter(Boolean),
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    function clearScreenshot() {
        updateField('screenshotUrl', '');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        const features = form.features.map((feature) => feature.trim()).filter(Boolean);
        if (features.length === 0) {
            setError('Add at least one feature bullet.');
            setSaving(false);
            return;
        }

        try {
            await updateLandingAppSection({ ...form, features });
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell
            title="Landing app section"
            actions={
                <Link href={route('home')} className="btn-secondary" target="_blank">
                    View landing page
                </Link>
            }
        >
            <Head title="Landing app section" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <form onSubmit={handleSubmit} className="card-surface max-w-3xl space-y-4 p-6">
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    {success && <p className="text-sm text-emerald-400">Landing app section saved.</p>}

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={(e) => updateField('enabled', e.target.checked)}
                        />
                        Show app section on landing page
                    </label>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="label-dark">Eyebrow label</label>
                            <input className="input-dark" value={form.eyebrow} onChange={(e) => updateField('eyebrow', e.target.value)} required />
                        </div>
                        <div>
                            <label className="label-dark">Mockup label</label>
                            <input className="input-dark" value={form.mockupLabel} onChange={(e) => updateField('mockupLabel', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label className="label-dark">Headline</label>
                        <input className="input-dark" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
                    </div>

                    <div>
                        <label className="label-dark">Description</label>
                        <textarea className="input-dark" rows={4} value={form.description} onChange={(e) => updateField('description', e.target.value)} required />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="label-dark mb-0">Feature bullets</label>
                            <button type="button" className="btn-secondary" onClick={addFeature}>
                                Add bullet
                            </button>
                        </div>
                        {form.features.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    className="input-dark"
                                    value={feature}
                                    onChange={(e) => updateFeature(index, e.target.value)}
                                    placeholder={`Feature ${index + 1}`}
                                />
                                {form.features.length > 1 && (
                                    <button type="button" className="btn-secondary shrink-0" onClick={() => removeFeature(index)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="label-dark">Google Play URL</label>
                        <input
                            className="input-dark"
                            value={form.playStoreUrl}
                            onChange={(e) => updateField('playStoreUrl', e.target.value)}
                            placeholder="https://play.google.com/store/apps/details?id=..."
                        />
                        <p className="mt-1 text-xs text-slate-500">Leave empty to show the coming soon message.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="label-dark">Download button label</label>
                            <input className="input-dark" value={form.buttonLabel} onChange={(e) => updateField('buttonLabel', e.target.value)} required />
                        </div>
                        <div>
                            <label className="label-dark">Coming soon label</label>
                            <input className="input-dark" value={form.comingSoonLabel} onChange={(e) => updateField('comingSoonLabel', e.target.value)} required />
                        </div>
                    </div>

                    <div>
                        <label className="label-dark">App screenshot</label>
                        <input className="input-dark" value={form.screenshotUrl} onChange={(e) => updateField('screenshotUrl', e.target.value)} placeholder="Image URL or upload below" />
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-2 text-sm"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleScreenshot(file);
                                e.target.value = '';
                            }}
                        />
                        {uploading && <p className="mt-2 text-xs text-slate-400">Uploading image…</p>}
                        {form.screenshotUrl && (
                            <div className="mt-4 space-y-3">
                                <p className="text-xs text-slate-500">Preview</p>
                                <div className="inline-block max-w-xs rounded-[1.5rem] border border-slate-700 bg-slate-950 p-3">
                                    <img
                                        src={form.screenshotUrl}
                                        alt="App screenshot preview"
                                        className="aspect-[9/16] w-full rounded-xl object-cover"
                                    />
                                </div>
                                <button type="button" className="btn-secondary" onClick={clearScreenshot}>
                                    Remove image
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Save app section'}
                        </button>
                        <Link href={route('admin.courses.index')} className="btn-secondary">
                            Back to admin
                        </Link>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
