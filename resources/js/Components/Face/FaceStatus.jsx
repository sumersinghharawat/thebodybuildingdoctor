const styles = {
    info: 'border-slate-700 bg-slate-900 text-slate-200',
    loading: 'border-blue-800/60 bg-blue-950/40 text-blue-200',
    success: 'border-emerald-800/60 bg-emerald-950/40 text-emerald-200',
    error: 'border-rose-800/60 bg-rose-950/40 text-rose-200',
    warning: 'border-amber-800/60 bg-amber-950/40 text-amber-200',
};

export default function FaceStatus({ tone = 'info', children }) {
    if (!children) {
        return null;
    }

    return (
        <div className={`rounded-lg border px-3 py-2 text-sm ${styles[tone] || styles.info}`} role="status">
            {children}
        </div>
    );
}
