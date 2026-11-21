import AdminShell from '@/Components/Admin/AdminShell';
import { StatusBadge } from '@/Components/Admin/AdminListControls';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
}

export default function SupportShow({ ticket }) {
    const { flash, errors } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({
        body: '',
        status: ticket.status === 'open' ? 'in_progress' : ticket.status,
    });

    function submit(e) {
        e.preventDefault();
        post(route('admin.support.reply', ticket.id), {
            preserveScroll: true,
            onSuccess: () => reset('body'),
        });
    }

    return (
        <AdminShell
            title={ticket.subject}
            description={`${ticket.name} · ${ticket.email}`}
            actions={
                <Link href={route('admin.support.index')} className="btn-secondary">
                    All tickets
                </Link>
            }
        >
            <Head title={`Support · ${ticket.subject}`} />

            {flash?.success && (
                <p className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                    {flash.success}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-6">
                    <article className="card-surface space-y-3 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge status={ticket.status} />
                            {ticket.createdAt && <span className="text-xs text-faint">{formatDate(ticket.createdAt)}</span>}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted">{ticket.message}</p>
                        {ticket.attachments?.length > 0 && (
                            <div className="space-y-3">
                                <h2 className="text-sm font-semibold">Attachments</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {ticket.attachments.map((file) => (
                                        <div key={file.id} className="overflow-hidden rounded-lg border border-edge">
                                            {file.kind === 'image' ? (
                                                <a href={file.url} target="_blank" rel="noreferrer">
                                                    <img src={file.url} alt={file.name} className="max-h-64 w-full object-contain bg-black/20" />
                                                </a>
                                            ) : (
                                                <video src={file.url} controls className="w-full bg-black" />
                                            )}
                                            <p className="truncate px-2 py-1 text-xs text-faint">{file.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">Replies</h2>
                        {ticket.replies?.length === 0 && (
                            <p className="text-sm text-muted">No replies yet.</p>
                        )}
                        <ul className="space-y-3">
                            {ticket.replies?.map((reply) => (
                                <li key={reply.id} className="card-surface space-y-2 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-faint">
                                        <span>{reply.authorName || 'Support'}</span>
                                        <span>{formatDate(reply.createdAt)}</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm text-muted">{reply.body}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <form onSubmit={submit} className="card-surface space-y-4 p-5">
                        <h2 className="text-lg font-semibold">Reply to member</h2>
                        <p className="text-xs text-faint">This message is emailed to {ticket.email}.</p>
                        <textarea
                            className="input-dark min-h-36"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            required
                            placeholder="Explain the fix, next steps, or ask for more detail…"
                        />
                        {errors?.body && <p className="text-sm text-red-300">{errors.body}</p>}
                        <div>
                            <label className="label-dark">Set status after sending</label>
                            <select
                                className="input-dark"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="in_progress">In progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="open">Open</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary" disabled={processing}>
                            {processing ? 'Sending…' : 'Send reply'}
                        </button>
                    </form>
                </div>

                <aside className="card-surface h-fit space-y-2 p-5 text-sm">
                    <p>
                        <span className="text-faint">From</span>
                        <br />
                        {ticket.name}
                    </p>
                    <p>
                        <span className="text-faint">Email</span>
                        <br />
                        <a href={`mailto:${ticket.email}`} className="text-accentSoft hover:underline">
                            {ticket.email}
                        </a>
                    </p>
                    <p>
                        <span className="text-faint">Status</span>
                        <br />
                        {ticket.status.replace('_', ' ')}
                    </p>
                </aside>
            </div>
        </AdminShell>
    );
}
