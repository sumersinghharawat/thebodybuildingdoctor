import AdminShell from '@/Components/Admin/AdminShell';
import {
    createBookPurchase,
    fetchBookPurchase,
    fetchBooks,
    fetchUsers,
    updateBookPurchase,
} from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BookAccessForm({ uid, bookId, prefillEmail = '', returnTo = null }) {
    const isEdit = Boolean(uid && bookId);
    const [users, setUsers] = useState([]);
    const [books, setBooks] = useState([]);
    const [form, setForm] = useState({
        uid: uid || '',
        bookId: bookId || '',
        status: 'active',
        source: 'admin',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchUsers(), fetchBooks()]).then(([userData, bookData]) => {
            setUsers(userData.users);
            setBooks(bookData.books);

            if (!isEdit && prefillEmail) {
                const match = userData.users.find((user) => user.email.toLowerCase() === prefillEmail.toLowerCase());
                if (match) {
                    setForm((prev) => ({ ...prev, uid: match.uid }));
                }
            }
        });

        if (isEdit) {
            fetchBookPurchase(uid, bookId).then((data) => {
                setForm({
                    uid: data.purchase.uid,
                    bookId: data.purchase.bookId,
                    status: data.purchase.status,
                    source: data.purchase.source,
                    note: data.purchase.note || '',
                });
            });
        }
    }, [uid, bookId, isEdit, prefillEmail]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateBookPurchase(uid, bookId, form);
            } else {
                await createBookPurchase(form);
            }
            router.visit(returnTo || route('admin.book-access.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit book access' : 'Grant book access'}>
            <Head title="Book access" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div>
                    <label className="label-dark">User</label>
                    <select
                        className="input-dark"
                        value={form.uid}
                        onChange={(e) => setForm((p) => ({ ...p, uid: e.target.value }))}
                        required
                        disabled={isEdit}
                    >
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.uid} value={user.uid}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Book</label>
                    <select
                        className="input-dark"
                        value={form.bookId}
                        onChange={(e) => setForm((p) => ({ ...p, bookId: e.target.value }))}
                        required
                        disabled={isEdit}
                    >
                        <option value="">Select book</option>
                        {books.map((book) => (
                            <option key={book.id} value={book.id}>
                                {book.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Status</label>
                    <select
                        className="input-dark"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Source</label>
                    <select
                        className="input-dark"
                        value={form.source}
                        onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                    >
                        <option value="admin">Admin</option>
                        <option value="purchase">Purchase</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Note</label>
                    <input
                        className="input-dark"
                        value={form.note}
                        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={route('admin.book-access.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
