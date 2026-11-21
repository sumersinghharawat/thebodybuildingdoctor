import { applyTheme, getPreferredTheme, toggleTheme } from '@/lib/theme';
import { useEffect, useState } from 'react';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState(() =>
        typeof document !== 'undefined' ? getPreferredTheme() : 'dark',
    );

    useEffect(() => {
        setTheme(applyTheme(getPreferredTheme()));
    }, []);

    function onToggle() {
        setTheme(toggleTheme());
    }

    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`inline-flex items-center justify-center rounded-lg border border-edge bg-surface px-2.5 py-2 text-muted transition hover:bg-surface-hover hover:text-foreground ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {isDark ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
            ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
                </svg>
            )}
        </button>
    );
}
