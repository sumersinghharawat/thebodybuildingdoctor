import VaultVideoPlayer from '@/Components/VaultVideoPlayer';
import RichContent from '@/Components/RichContent';
import AppLayout from '@/Layouts/AppLayout';
import MarketingLayout from '@/Layouts/MarketingLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function VaultShow({
    video,
    paymentQrUrl = '',
    paymentInstructions = '',
    canPurchase = false,
    authenticated = false,
}) {
    const { site, flash } = usePage().props;
    const currency = site?.currency || 'INR';
    const [submitting, setSubmitting] = useState(false);
    const [previewEnded, setPreviewEnded] = useState(false);
    const Layout = authenticated ? AppLayout : MarketingLayout;
    const priceLabel = video.isFree ? 'Free' : formatPrice(video.priceCents, currency);

    function confirmPayment() {
        if (
            !confirm(
                'Confirm that you have completed payment via the QR code? An administrator will verify and unlock the full video.',
            )
        ) {
            return;
        }

        setSubmitting(true);
        router.post(route('vault.request', video.id), {}, { onFinish: () => setSubmitting(false) });
    }

    return (
        <Layout>
            <Head title={video.title} />
            <div className={authenticated ? 'mx-auto max-w-4xl space-y-6 p-6 md:p-8' : 'space-y-6 py-10'}>
                <Link
                    href={authenticated ? route('vault.index') : `${route('home')}#vault`}
                    className="text-sm text-muted hover:text-foreground"
                >
                    ← Back to Bodybuilding Vault
                </Link>

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

                <div className="relative">
                    <VaultVideoPlayer
                        videoUrl={video.videoUrl}
                        title={video.title}
                        previewSeconds={video.hasAccess ? null : video.previewSeconds}
                        onPreviewLimit={() => setPreviewEnded(true)}
                    />
                    {!video.hasAccess && (
                        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                            {video.previewSeconds}s preview
                        </span>
                    )}
                    {!video.hasAccess && previewEnded && video.accessStatus !== 'pending' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/75 px-6 text-center">
                            <div className="max-w-sm space-y-2">
                                <p className="text-lg font-semibold text-white">Preview ended</p>
                                <p className="text-sm text-white/80">
                                    The full video is {priceLabel}. Pay to keep watching.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">Bodybuilding Vault</p>
                    <h1 className="text-2xl font-bold">{video.title}</h1>
                    <p className="text-lg font-semibold text-accentSoft">{priceLabel}</p>
                    {video.descriptionHtml ? (
                        <RichContent html={video.descriptionHtml} />
                    ) : (
                        <p className="text-sm text-muted">{video.description}</p>
                    )}
                </div>

                {video.hasAccess ? (
                    <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                        Full video unlocked.
                    </p>
                ) : video.accessStatus === 'pending' ? (
                    <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                        Payment confirmation is pending admin approval. You can keep watching the {video.previewSeconds}{' '}
                        second preview until the full video is unlocked.
                    </p>
                ) : canPurchase ? (
                    <div className="card-surface space-y-4 p-5">
                        <h2 className="font-semibold">Unlock this video</h2>
                        <p className="text-sm text-muted">
                            {paymentInstructions ||
                                'Scan the QR code to pay for this video, then confirm payment. The full video unlocks after an administrator verifies it.'}
                        </p>
                        {paymentQrUrl ? (
                            <img
                                src={paymentQrUrl}
                                alt="Payment QR code"
                                className="h-48 w-48 rounded-lg border border-edge bg-white object-contain p-2"
                            />
                        ) : (
                            <p className="text-sm text-amber-300">
                                Payment QR is not configured yet. Contact an administrator.
                            </p>
                        )}
                        <button
                            type="button"
                            className="btn-primary"
                            disabled={submitting || !paymentQrUrl}
                            onClick={confirmPayment}
                        >
                            {submitting ? 'Submitting…' : 'I have paid — request full access'}
                        </button>
                    </div>
                ) : authenticated ? (
                    <p className="rounded-lg border border-edge bg-surface px-4 py-3 text-sm text-muted">
                        Full access is granted by an administrator after payment. You can watch the first{' '}
                        {video.previewSeconds} seconds.
                    </p>
                ) : (
                    <div className="card-surface space-y-3 p-5">
                        <h2 className="font-semibold">Unlock this video</h2>
                        <p className="text-sm text-muted">
                            Sign in to pay {priceLabel} and request the full video. An administrator allocates access
                            after payment is verified.
                        </p>
                        <Link href={route('vault.purchase', video.id)} className="btn-primary inline-flex">
                            Sign in to purchase
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
}
