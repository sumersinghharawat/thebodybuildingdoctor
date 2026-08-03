import AdminShell from '@/Components/Admin/AdminShell';
import { deleteBook, fetchBooks } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BooksAdminIndex() {
    const { site } = usePage().props;
    const currency = site?.currency || 'INR';
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchBooks()
            .then((data) => setBooks(data.books))
            .finally(() => setLoading(false));
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? books
        : books.filter((book) =>
              [book.title, book.published ? 'published' : 'draft']
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q)),
          );

    async function handleDelete(book) {
        if (!confirm(`Delete "${book.title}"?`)) return;
        await deleteBook(book.id);
        setBooks((prev) => prev.filter((item) => item.id !== book.id));
    }

    return (
        <AdminShell
            title="Books"
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
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by title or status…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search books"
                    />
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted">
                            {query.trim() ? 'No books match your search.' : 'No books yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((book) => (
                                <article
                                    key={book.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <p className="font-medium">{book.title}</p>
                                        <p className="mt-1 text-xs text-muted">
                                            {formatPrice(book.priceCents, currency)} ·{' '}
                                            <span className={book.published ? 'text-emerald-400' : 'text-amber-400'}>
                                                {book.published ? 'Published' : 'Draft'}
                                            </span>
                                            {book.hasPdf ? ' · PDF ready' : ' · No PDF'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.books.edit', book.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-300"
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
