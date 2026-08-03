import ThemeToggle from '@/Components/ThemeToggle';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatCountdown(ms) {
    if (ms <= 0) return 'Going live…';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export default function Maintenance({ siteName, until, untilLabel }) {
    const [countdown, setCountdown] = useState(() => {
        if (!until) return null;
        return formatCountdown(new Date(until).getTime() - Date.now());
    });

    useEffect(() => {
        if (!until) return undefined;

        const target = new Date(until).getTime();

        const tick = () => {
            const remaining = target - Date.now();
            if (remaining <= 0) {
                setCountdown('Going live…');
                window.location.reload();
                return;
            }
            setCountdown(formatCountdown(remaining));
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [until]);

    return (
        <>
            <Head title="Under maintenance" />
            <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center text-foreground">
                <div className="absolute right-4 top-4 z-20">
                    <ThemeToggle />
                </div>
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(93, 27, 29, 0.55), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(93, 27, 29, 0.25), transparent)',
                    }}
                />

                <div className="relative z-10 max-w-lg">
                    <p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">{siteName}</p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        We’ll be back shortly
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-muted">
                        The website is under maintenance right now. Thanks for your patience — we’re
                        making things better for you.
                    </p>

                    {untilLabel && (
                        <div className="mt-8 border border-edge/80 bg-surface/50 px-6 py-5">
                            <p className="text-xs tracking-wide text-muted uppercase">Expected back online</p>
                            <p className="mt-2 text-xl font-semibold text-foreground">{untilLabel}</p>
                            {countdown && (
                                <p className="mt-3 font-mono text-sm text-accent tabular-nums">{countdown}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
