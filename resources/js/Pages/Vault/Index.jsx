import AppLayout from '@/Layouts/AppLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';

export default function VaultIndex({
    videos = [],
    paymentQrUrl = '',
    paymentInstructions = '',
    canBrowseCatalog = true,
}) {
    const { site, flash } = usePage().props;
    const currency = site?.currency || 'INR';

    return (
        <AppLayout>
            <Head title="Bodybuilding Vault" />
            <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
                <header className="space-y-2">
                    <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">Bodybuilding Vault</p>
                    <h1 className="text-2xl font-bold">Paid videos</h1>
                    <p className="text-sm text-muted">
                        {canBrowseCatalog
                            ? 'Each video has its own price. Watch a 30 second preview, then pay to unlock the full video after admin approval.'
                            : 'Videos an administrator has unlocked for you.'}
                    </p>
                </header>

                {flash?.success && (
                    <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                        {flash.success}
                    </p>
                )}
                {flash?.error && (
                    <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                        {flash.error}
                    </p>
                )}

                {(paymentQrUrl || paymentInstructions) && (
                    <section className="card-surface flex flex-col gap-4 p-5 md:flex-row md:items-center">
                        {paymentQrUrl ? (
                            <img
                                src={paymentQrUrl}
                                alt="Payment QR code"
                                className="mx-auto h-40 w-40 rounded-lg border border-edge bg-white object-contain p-2 md:mx-0"
                            />
                        ) : null}
                        <div className="space-y-2">
                            <h2 className="font-semibold">Payment</h2>
                            <p className="text-sm text-muted">
                                {paymentInstructions ||
                                    'Scan the QR code to pay for a video, then confirm payment on that video for admin approval.'}
                            </p>
                        </div>
                    </section>
                )}

                {videos.length === 0 ? (
                    <p className="text-sm text-muted">
                        {canBrowseCatalog ? 'No vault videos published yet.' : 'You do not have any unlocked vault videos yet.'}
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {videos.map((video) => (
                            <article key={video.id} className="card-surface overflow-hidden">
                                <Link href={route('vault.show', video.id)} className="block">
                                    {video.thumbnailUrl ? (
                                        <img src={video.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                                    ) : (
                                        <div className="flex aspect-video items-center justify-center bg-surface text-faint">
                                            Video
                                        </div>
                                    )}
                                    <div className="space-y-2 p-4">
                                        <h2 className="font-semibold">{video.title}</h2>
                                        <p className="line-clamp-2 text-xs text-muted">{video.description}</p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-medium text-accentSoft">
                                                {video.isFree ? 'Free' : formatPrice(video.priceCents, currency)}
                                            </span>
                                            <span className="text-xs text-faint">
                                                {video.hasAccess
                                                    ? 'Full video'
                                                    : video.accessStatus === 'pending'
                                                      ? 'Pending'
                                                      : `${video.previewSeconds}s preview`}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
