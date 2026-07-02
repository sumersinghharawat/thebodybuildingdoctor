export default function VideoUrlField({ label = 'Video URL', value = '', onChange }) {
    return (
        <div>
            <label className="label-dark">{label}</label>
            <input
                className="input-dark"
                placeholder="YouTube, Vimeo, or direct file URL"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
                Paste a YouTube/Vimeo link or a direct link to an MP4/MOV file.
            </p>
        </div>
    );
}
