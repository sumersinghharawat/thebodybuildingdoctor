import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';

export default function MarketingLayout({ children, showAppLink = true }) {
    const home = route('home');

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-20 border-b border-edge bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                    <Link href={home} className="text-lg font-semibold">
                        The Bodybuilding Doctor
                    </Link>
                    <nav className="hidden items-center gap-5 text-sm sm:flex">
                        <a href={`${home}#courses`} className="text-muted hover:text-foreground">
                            Courses
                        </a>
                        <a href={`${home}#books`} className="text-muted hover:text-foreground">
                            Books
                        </a>
                        <a href={`${home}#mentorship`} className="text-muted hover:text-foreground">
                            Mentorship
                        </a>
                        {showAppLink && (
                            <a href={`${home}#app`} className="text-muted hover:text-foreground">
                                App
                            </a>
                        )}
                        <a href={`${home}#apply`} className="text-muted hover:text-foreground">
                            Apply
                        </a>
                        <Link href={route('support.create')} className="text-muted hover:text-foreground">
                            Technical support
                        </Link>
                        <ThemeToggle />
                        <Link
                            href={route('login')}
                            className="rounded-full bg-accent px-4 py-2 font-semibold text-white"
                        >
                            Member login
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2 sm:hidden">
                        <Link href={route('support.create')} className="text-sm text-muted">
                            Support
                        </Link>
                        <ThemeToggle />
                        <Link
                            href={route('login')}
                            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-6">{children}</main>
            <footer className="mt-16 border-t border-edge py-8 text-center text-sm text-faint">
                © {new Date().getFullYear()} The Bodybuilding Doctor
            </footer>
        </div>
    );
}
