import { uploadPdf } from '@/lib/admin-api';
import { useState } from 'react';

export default function PdfUploadField({ label = 'PDF', value = '', onChange, folder }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    async function handleUpload(file) {
        setUploading(true);
        setError(null);
        try {
            const { url } = await uploadPdf(file, folder);
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
                placeholder="PDF URL or upload below"
            />
            <input
                type="file"
                accept="application/pdf,.pdf"
                className="mt-2 text-sm"
                disabled={uploading}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = '';
                }}
            />
            {uploading && <p className="mt-1 text-xs text-slate-400">Uploading PDF…</p>}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            {value && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline">
                        View uploaded PDF
                    </a>
                    <button type="button" className="btn-secondary" onClick={() => onChange('')}>
                        Remove PDF
                    </button>
                </div>
            )}
        </div>
    );
}
