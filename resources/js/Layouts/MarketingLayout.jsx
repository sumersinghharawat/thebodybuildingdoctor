import { Link } from '@inertiajs/react';

export default function MarketingLayout({ children }) {
    const home = route('home');

    return (
        <div className="min-h-screen bg-background text-slate-100">
            <header className="sticky top-0 z-20 border-b border-slate-800 bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href={home} className="text-lg font-semibold">
                        The Bodybuilding Doctor
                    </Link>
                    <nav className="hidden items-center gap-5 text-sm sm:flex">
                        <a href={`${home}#courses`} className="text-slate-300 hover:text-white">
                            Courses
                        </a>
                        <a href={`${home}#mentorship`} className="text-slate-300 hover:text-white">
                            Mentorship
                        </a>
                        <a href={`${home}#app`} className="text-slate-300 hover:text-white">
                            App
                        </a>
                        <a href={`${home}#apply`} className="text-slate-300 hover:text-white">
                            Apply
                        </a>
                        <Link
                            href={route('login')}
                            className="rounded-full bg-accent px-4 py-2 font-semibold text-white"
                        >
                            Member login
                        </Link>
                    </nav>
                    <Link
                        href={route('login')}
                        className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white sm:hidden"
                    >
                        Login
                    </Link>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6">{children}</main>
            <footer className="mt-16 border-t border-slate-800 py-8 text-center text-sm text-slate-500">
                © {new Date().getFullYear()} The Bodybuilding Doctor
            </footer>
        </div>
    );
}
