import AppLayout from '@/Layouts/AppLayout';
import BookPdfViewer from '@/Components/BookPdfViewer';
import { Head, Link } from '@inertiajs/react';

export default function BookRead({ book, pdfStreamUrl }) {
    return (
        <AppLayout>
            <Head title={`Read · ${book.title}`} />
            <div
                className="flex h-[calc(100vh-1px)] flex-col"
                onContextMenu={(event) => event.preventDefault()}
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-edge px-4 py-3 md:px-6">
                    <div>
                        <Link href={route('books.show', book.id)} className="text-sm text-muted hover:text-foreground">
                            ← Back
                        </Link>
                        <h1 className="text-lg font-semibold">{book.title}</h1>
                        <p className="text-xs text-faint">Website reading only · download disabled</p>
                    </div>
                </div>
                <div className="min-h-0 flex-1 bg-background p-2 md:p-4">
                    <BookPdfViewer src={pdfStreamUrl} title={book.title} />
                </div>
            </div>
        </AppLayout>
    );
}
