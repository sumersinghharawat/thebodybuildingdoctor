import { uploadThumbnail } from '@/lib/admin-api';
import { useState } from 'react';

export default function ThumbnailUploadField({ label = 'Thumbnail', value = '', onChange, folder = 'courses' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    async function handleUpload(file) {
        setUploading(true);
        setError(null);
        try {
            const { url } = await uploadThumbnail(file, folder);
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
                placeholder="Image URL or upload below"
            />
            <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm"
                disabled={uploading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = '';
                }}
            />
            {uploading && <p className="mt-1 text-xs text-slate-400">Uploading image…</p>}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            {value && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <img src={value} alt="" className="h-16 w-24 rounded object-cover" />
                    <button type="button" className="btn-secondary" onClick={() => onChange('')}>
                        Remove thumbnail
                    </button>
                </div>
            )}
        </div>
    );
}
