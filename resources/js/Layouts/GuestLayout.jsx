import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
            <Link href="/" className="mb-8 text-lg font-semibold text-slate-100">
                The Bodybuilding Doctor
            </Link>
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-soft-glow">
                {children}
            </div>
        </div>
    );
}
