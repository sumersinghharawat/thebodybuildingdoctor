import { uploadApp } from '@/lib/admin-api';
import { useState } from 'react';

export default function AppUploadField({ label = 'Android app (APK)', value = '', onChange }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const testHref = value.includes('/apps/') || value.startsWith('apps/') ? '/download/android' : value;

    async function handleUpload(file) {
        setUploading(true);
        setError(null);
        try {
            const { url } = await uploadApp(file);
            onChange(url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div>
            <label className="label-dark">{label}</label>
            <input
                className="input-dark"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="APK download URL or upload below"
            />
            <input
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                className="mt-2 text-sm"
                disabled={uploading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = '';
                }}
            />
            {uploading && <p className="mt-1 text-xs text-slate-400">Uploading APK… this may take a minute.</p>}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            {value && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a href={testHref} className="text-sm text-amber-400 hover:underline">
                        Test APK download
                    </a>
                    <button type="button" className="btn-secondary" onClick={() => onChange('')}>
                        Remove APK
                    </button>
                </div>
            )}
            <p className="mt-1 text-xs text-slate-500">
                Upload the Android APK. Visitors download it from <code className="text-slate-400">/download/android</code> as a proper .apk file.
            </p>
        </div>
    );
}
