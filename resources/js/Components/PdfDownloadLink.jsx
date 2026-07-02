import { Head } from '@inertiajs/react';

export default function PdfDownloadLink({ url, label = 'Download PDF' }) {
    if (!url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
        >
            <PdfIcon />
            {label}
        </a>
    );
}

function PdfIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-400" fill="currentColor" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2 5 5h-5V4zM8 13h1.5v4H8v-4zm3.5 0H14c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5h-.5v1.5h-1.5V13zm1.5 2.5c.3 0 .5-.2.5-.5v-1c0-.3-.2-.5-.5-.5h-.5v2h.5zM16 13h1.8c1 0 1.7.8 1.7 1.8S18.8 16.5 17.8 16.5H16v-3.5zm1.5 2c.4 0 .8-.4.8-.8s-.4-.7-.8-.7H17.5V15H18z" />
        </svg>
    );
}
