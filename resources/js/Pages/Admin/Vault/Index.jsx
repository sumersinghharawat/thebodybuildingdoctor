import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteVaultVideo, fetchVaultVideos } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function VaultAdminIndex() {
    const { site } = usePage().props;
    const currency = site?.currency || 'INR';
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchVaultVideos()
            .then((data) => setVideos(data.videos))
            .finally(() => setLoading(false));
    }, []);

    const counts = useMemo(
        () => ({
            all: videos.length,
            published: videos.filter((item) => item.published).length,
            draft: videos.filter((item) => !item.published).length,
        }),
        [videos],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return videos
            .filter((video) => {
                if (statusFilter === 'published' && !video.published) return false;
                if (statusFilter === 'draft' && video.published) return false;
                if (!q) return true;
                return [video.title, video.published ? 'published' : 'draft']
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }, [videos, query, statusFilter]);

    async function handleDelete(video) {
        if (!confirm(`Delete "${video.title}"?`)) return;
        await deleteVaultVideo(video.id);
        setVideos((prev) => prev.filter((item) => item.id !== video.id));
    }

    return (
        <AdminShell
            title="Bodybuilding Vault"
            description="Publish paid videos. Members watch a short preview, then pay for the full video."
            actions={
                <Link href={route('admin.vault.create')} className="btn-primary">
                    New video
                </Link>
            }
        >
            <Head title="Vault videos" />
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
                        resultLabel={`${filtered.length} video${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No videos match' : 'No vault videos yet'}
                            description="Add a video, set its price, and publish it to the Bodybuilding Vault."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((video) => (
                                <article
                                    key={video.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{video.title}</p>
                                            <StatusBadge status={video.published ? 'published' : 'draft'} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted">
                                            {formatPrice(video.priceCents, currency)} · {video.previewSeconds}s preview
                                            {video.videoUrl ? '' : ' · No video URL'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.vault.edit', video.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-600 dark:text-red-300"
                                            onClick={() => handleDelete(video)}
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
