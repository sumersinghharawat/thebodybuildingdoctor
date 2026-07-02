import AdminShell from '@/Components/Admin/AdminShell';
import { deleteBlog, fetchBlogs } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BlogsIndex() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs()
            .then((data) => setBlogs(data.blogs))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(blog) {
        if (!confirm(`Delete "${blog.title}"?`)) return;
        await deleteBlog(blog.id);
        setBlogs((prev) => prev.filter((item) => item.id !== blog.id));
    }

    return (
        <AdminShell
            title="Blogs"
            actions={
                <Link href={route('admin.blogs.create')} className="btn-primary">
                    New article
                </Link>
            }
        >
            <Head title="Blogs" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    {blogs.map((blog) => (
                        <article key={blog.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium">{blog.title}</p>
                                <p className="text-xs text-slate-400">
                                    {blog.published ? 'Published' : 'Draft'} · {blog.authorName}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.blogs.edit', blog.id)} className="btn-secondary">
                                    Edit
                                </Link>
                                <button type="button" className="btn-secondary text-red-300" onClick={() => handleDelete(blog)}>
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AdminShell>
    );
}
