import AppLayout from '@/Layouts/AppLayout';
import RichContent from '@/Components/RichContent';
import { formatPrice } from '@/lib/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function BookShow({
    book,
    paymentQrUrl = '',
    paymentInstructions = '',
    canRead = false,
}) {
    const { site, flash } = usePage().props;
    const currency = site?.currency || 'INR';
    const [submitting, setSubmitting] = useState(false);

    function confirmPayment() {
        if (
            !confirm(
                'Confirm that you have completed payment via the QR code? An administrator will verify and unlock reading access.',
            )
        ) {
            return;
        }
        setSubmitting(true);
        router.post(route('books.request', book.id), {}, { onFinish: () => setSubmitting(false) });
    }

    return (
        <AppLayout>
            <Head title={book.title} />
            <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
                <Link href={route('books.index')} className="text-sm text-muted hover:text-foreground">
                    ← Back to books
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

                <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                    {book.thumbnailUrl ? (
                        <img
                            src={book.thumbnailUrl}
                            alt=""
                            className="w-full rounded-xl border border-edge object-cover"
                        />
                    ) : (
                        <div className="flex aspect-[3/4] items-center justify-center rounded-xl border border-edge bg-surface text-faint">
                            Book cover
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold">{book.title}</h1>
                            <p className="mt-2 text-lg font-semibold text-accentSoft">
                                {formatPrice(book.priceCents, currency)}
                            </p>
                        </div>

                        {book.descriptionHtml ? (
                            <RichContent html={book.descriptionHtml} />
                        ) : (
                            <p className="text-sm text-muted">{book.description}</p>
                        )}

                        {canRead ? (
                            <Link href={route('books.read', book.id)} className="btn-primary inline-flex">
                                Read on website
                            </Link>
                        ) : book.accessStatus === 'pending' ? (
                            <p className="rounded-lg border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
                                Payment confirmation is pending admin approval.
                            </p>
                        ) : (
                            <div className="card-surface space-y-4 p-5">
                                <h2 className="font-semibold">Buy this book</h2>
                                <p className="text-sm text-muted">
                                    {paymentInstructions ||
                                        'Scan the QR code to pay, then confirm payment below. Reading unlocks after admin verification.'}
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
                                    {submitting ? 'Submitting…' : 'I have paid — request access'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
