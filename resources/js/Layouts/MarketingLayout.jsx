import { Link } from '@inertiajs/react';

export default function MarketingLayout({ children }) {
    return (
        <div className="min-h-screen bg-background text-slate-100">
            <header className="sticky top-0 z-20 border-b border-slate-800 bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="text-lg font-semibold">
                        The Bodybuilding Doctor
                    </Link>
                    <nav className="flex items-center gap-4 text-sm">
                        <a href="#courses" className="text-slate-300 hover:text-white">
                            Courses
                        </a>
                        <a href="#apply" className="text-slate-300 hover:text-white">
                            Apply
                        </a>
                        <Link
                            href={route('login')}
                            className="rounded-full bg-accent px-4 py-2 font-semibold text-white"
                        >
                            Member login
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6">{children}</main>
            <footer className="mt-16 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} The Bodybuilding Doctor
            </footer>
        </div>
    );
}
