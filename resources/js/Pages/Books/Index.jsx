import AppLayout from '@/Layouts/AppLayout';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';

export default function BooksIndex({ books = [], paymentQrUrl = '', paymentInstructions = '', canBrowseCatalog = true }) {
    const { site, flash } = usePage().props;
    const currency = site?.currency || 'INR';

    return (
        <AppLayout>
            <Head title="Books" />
            <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
                <header className="space-y-2">
                    <h1 className="text-2xl font-bold">Books</h1>
                    <p className="text-sm text-muted">
                        {canBrowseCatalog
                            ? 'Purchase via QR payment. After admin approval, read books only on this website.'
                            : 'Books an administrator has granted you access to.'}
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
                                    'Scan the QR code to pay, then open a book and confirm payment for admin approval.'}
                            </p>
                        </div>
                    </section>
                )}

                {books.length === 0 ? (
                    <p className="text-sm text-muted">
                        {canBrowseCatalog ? 'No books published yet.' : 'You do not have access to any books yet.'}
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {books.map((book) => (
                            <article key={book.id} className="card-surface overflow-hidden">
                                <Link href={route('books.show', book.id)} className="block">
                                    {book.thumbnailUrl ? (
                                        <img
                                            src={book.thumbnailUrl}
                                            alt=""
                                            className="aspect-[4/3] w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center bg-surface text-faint">
                                            Book
                                        </div>
                                    )}
                                    <div className="space-y-2 p-4">
                                        <h2 className="font-semibold">{book.title}</h2>
                                        <p className="line-clamp-2 text-xs text-muted">{book.description}</p>
                                        <div className="flex items-center justify-between pt-1">
                                            <span className="text-sm font-medium text-accentSoft">
                                                {formatPrice(book.priceCents, currency)}
                                            </span>
                                            <span className="text-xs text-faint">
                                                {book.hasAccess
                                                    ? 'Unlocked'
                                                    : book.accessStatus === 'pending'
                                                      ? 'Pending'
                                                      : 'Locked'}
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
