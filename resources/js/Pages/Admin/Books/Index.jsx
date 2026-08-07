import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteBook, fetchBooks } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function BooksAdminIndex() {
    const { site } = usePage().props;
    const currency = site?.currency || 'INR';
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchBooks()
            .then((data) => setBooks(data.books))
            .finally(() => setLoading(false));
    }, []);

    const counts = useMemo(() => ({
        all: books.length,
        published: books.filter((item) => item.published).length,
        draft: books.filter((item) => !item.published).length,
    }), [books]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return books
            .filter((book) => {
                if (statusFilter === 'published' && !book.published) return false;
                if (statusFilter === 'draft' && book.published) return false;
                if (!q) return true;
                return [book.title, book.published ? 'published' : 'draft', book.hasPdf ? 'pdf' : '']
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }, [books, query, statusFilter]);

    async function handleDelete(book) {
        if (!confirm(`Delete "${book.title}"?`)) return;
        await deleteBook(book.id);
        setBooks((prev) => prev.filter((item) => item.id !== book.id));
    }

    return (
        <AdminShell
            title="Books"
            description="Publish books and manage PDF reading access."
            actions={
                <Link href={route('admin.books.create')} className="btn-primary">
                    New book
                </Link>
            }
        >
            <Head title="Books" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by title…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'published', label: 'Published', count: counts.published },
                            { value: 'draft', label: 'Draft', count: counts.draft },
                        ]}
                        resultLabel={`${filtered.length} book${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No books match' : 'No books yet'}
                            description="Add a book with a PDF to start selling reading access."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((book) => (
                                <article
                                    key={book.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{book.title}</p>
                                            <StatusBadge status={book.published ? 'published' : 'draft'} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted">
                                            {formatPrice(book.priceCents, currency)}
                                            {book.hasPdf ? ' · PDF ready' : ' · No PDF'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.books.edit', book.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-600 dark:text-red-300"
                                            onClick={() => handleDelete(book)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
