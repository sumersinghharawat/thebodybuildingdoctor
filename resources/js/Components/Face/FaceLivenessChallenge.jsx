import FaceStatus from '@/Components/Face/FaceStatus';

export default function FaceLivenessChallenge({ label, hint, passed, status }) {
    return (
        <div className="space-y-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Liveness check</p>
                <p className="mt-1 text-base font-semibold text-slate-100">{label}</p>
                <p className="mt-1 text-sm text-slate-400">{hint}</p>
            </div>

            {passed ? (
                <FaceStatus tone="success">Liveness verified. You can log in now.</FaceStatus>
            ) : (
                <FaceStatus tone={status === 'multiple_faces' || status === 'no_face' ? 'warning' : 'loading'}>
                    {hint}
                </FaceStatus>
            )}
        </div>
    );
}
