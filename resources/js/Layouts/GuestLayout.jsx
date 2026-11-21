import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <Link href="/" className="mb-8 text-lg font-semibold text-foreground">
                The Bodybuilding Doctor
            </Link>
            <div className="w-full max-w-md rounded-xl border border-edge bg-surface/80 p-6 shadow-soft-glow">
                {children}
            </div>
        </div>
    );
}
