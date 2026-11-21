import AppLayout from '@/Layouts/AppLayout';
import MarketingLayout from '@/Layouts/MarketingLayout';
import { executeRecaptcha } from '@/lib/recaptcha';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function statusLabel(status) {
    if (status === 'in_progress') return 'In progress';
    if (status === 'resolved') return 'Resolved';
    return 'Open';
}

export default function SupportCreate({ tickets = [] }) {
    const { auth, flash, recaptcha, errors } = usePage().props;
    const user = auth?.user;
    const recaptchaEnabled = Boolean(recaptcha?.enabled && recaptcha?.siteKey);
    const [recaptchaError, setRecaptchaError] = useState(null);

    const { data, setData, post, processing, reset, transform } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
        attachments: [],
        recaptchaToken: '',
    });

    async function submit(e) {
        e.preventDefault();
        setRecaptchaError(null);

        try {
            if (recaptchaEnabled) {
                const token = await executeRecaptcha(recaptcha.siteKey, 'support');
                transform((form) => ({ ...form, recaptchaToken: token }));
            } else {
                transform((form) => ({ ...form, recaptchaToken: '' }));
            }

            post(route('support.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    reset('subject', 'message', 'attachments', 'recaptchaToken');
                },
            });
        } catch {
            setRecaptchaError('Could not verify reCAPTCHA. Please refresh and try again.');
        }
    }

    const Layout = user ? AppLayout : MarketingLayout;
    const layoutProps = user ? {} : { showAppLink: true };

    return (
        <Layout {...layoutProps}>
            <Head title="Technical support" />
            <div className={`${user ? 'mx-auto max-w-3xl p-6 md:p-8' : 'mx-auto max-w-3xl py-10'} space-y-8`}>
                <header className="space-y-2">
                    <h1 className="text-2xl font-bold">Technical support</h1>
                    <p className="text-sm text-muted">
                        Describe the issue and attach a screenshot or short video if it helps. We will email you when
                        support replies.
                    </p>
                </header>

                {flash?.success && (
                    <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                        {flash.success}
                    </p>
                )}

                <form onSubmit={submit} className="card-surface space-y-4 p-6" encType="multipart/form-data">
                    {!user && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="label-dark" htmlFor="support-name">
                                    Name
                                </label>
                                <input
                                    id="support-name"
                                    className="input-dark"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors?.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="label-dark" htmlFor="support-email">
                                    Email
                                </label>
                                <input
                                    id="support-email"
                                    type="email"
                                    className="input-dark"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors?.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="label-dark" htmlFor="support-subject">
                            Subject
                        </label>
                        <input
                            id="support-subject"
                            className="input-dark"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            required
                            maxLength={180}
                            placeholder="Login issue, video not playing…"
                        />
                        {errors?.subject && <p className="mt-1 text-sm text-red-300">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="label-dark" htmlFor="support-message">
                            What happened?
                        </label>
                        <textarea
                            id="support-message"
                            className="input-dark min-h-40"
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            required
                            maxLength={5000}
                            placeholder="Tell us what you were doing, what you expected, and what you saw instead."
                        />
                        {errors?.message && <p className="mt-1 text-sm text-red-300">{errors.message}</p>}
                    </div>

                    <div>
                        <label className="label-dark" htmlFor="support-attachments">
                            Screenshot or video (optional)
                        </label>
                        <input
                            id="support-attachments"
                            type="file"
                            className="mt-1 block w-full text-sm"
                            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov"
                            multiple
                            onChange={(e) => setData('attachments', Array.from(e.target.files || []).slice(0, 4))}
                        />
                        <p className="mt-1 text-xs text-faint">
                            Up to 4 files. Screenshots up to 8MB, videos up to 50MB (MP4, WebM, or MOV).
                        </p>
                        {data.attachments?.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-muted">
                                {data.attachments.map((file) => (
                                    <li key={`${file.name}-${file.size}`}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                        {errors?.attachments && <p className="mt-1 text-sm text-red-300">{errors.attachments}</p>}
                    </div>

                    {(recaptchaError || errors?.recaptchaToken) && (
                        <p className="text-sm text-red-300">{recaptchaError || errors.recaptchaToken}</p>
                    )}

                    <button type="submit" className="btn-primary" disabled={processing}>
                        {processing ? 'Sending…' : 'Send support request'}
                    </button>
                </form>

                {user && tickets.length > 0 && (
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold">Your recent requests</h2>
                        <ul className="divide-y divide-edge rounded-xl border border-edge">
                            {tickets.map((ticket) => (
                                <li key={ticket.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">{ticket.subject}</p>
                                        {ticket.createdAt && (
                                            <p className="text-xs text-faint">
                                                {new Date(ticket.createdAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className="pill shrink-0 normal-case tracking-normal">
                                        {statusLabel(ticket.status)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </Layout>
    );
}
