import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function guestApplyUrl(course) {
    const params = new URLSearchParams({
        courseId: course.id,
        courseTitle: course.title,
    });

    return `${route('home')}?${params.toString()}#apply`;
}

export default function CourseRequestButton({
    course,
    enrolled = false,
    className = '',
    compact = false,
}) {
    const { auth } = usePage().props;
    const [submitted, setSubmitted] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (enrolled) {
        return null;
    }

    if (submitted) {
        return (
            <span className={`text-xs font-medium text-emerald-400 ${className}`.trim()}>
                Request sent
            </span>
        );
    }

    const buttonClass = compact
        ? 'inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white disabled:opacity-50'
        : 'inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50';

    if (auth?.user) {
        return (
            <button
                type="button"
                className={`${buttonClass} ${className}`.trim()}
                disabled={processing}
                onClick={() => {
                    setProcessing(true);
                    router.post(route('learn.courses.request', course.id), {}, {
                        preserveScroll: true,
                        onSuccess: () => setSubmitted(true),
                        onFinish: () => setProcessing(false),
                    });
                }}
            >
                {processing ? 'Sending…' : 'Request access'}
            </button>
        );
    }

    return (
        <Link href={guestApplyUrl(course)} className={`${buttonClass} ${className}`.trim()}>
            Request access
        </Link>
    );
}
