import PdfDownloadLink from '@/Components/PdfDownloadLink';
import CourseRequestButton from '@/Components/CourseRequestButton';
import CourseVideoPlayer from '@/Components/CourseVideoPlayer';
import RichContent from '@/Components/RichContent';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function LearnCourse({ course, enrolled, lessons }) {
    const { flash } = usePage().props;
    return (
        <AppLayout>
            <Head title={course.title} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                <Link href={route('learn.index')} className="text-sm text-slate-400 hover:text-slate-200">
                    ← All courses
                </Link>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                {course.descriptionHtml ? (
                    <RichContent
                        html={course.descriptionHtml}
                        className="text-sm text-slate-400"
                        embedPlaybackUrl={(slot) => route('learn.courses.embed.playback', [course.id, slot])}
                    />
                ) : (
                    <p className="text-sm text-slate-400">{course.description}</p>
                )}

                {course.hasVideo && <CourseVideoPlayer courseId={course.id} title={course.title} />}

                <PdfDownloadLink url={course.pdfUrl} label="Download course PDF" />

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

                {!enrolled && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                        <p className="text-sm text-slate-400">
                            Enrollment is managed by an administrator. Request access to this course below.
                        </p>
                        <div className="mt-3 max-w-xs">
                            <CourseRequestButton course={course} enrolled={enrolled} />
                        </div>
                    </div>
                )}

                <ol className="divide-y divide-slate-800 rounded-xl border border-slate-800">
                    {lessons.map((lesson, index) => (
                        <li key={lesson.id}>
                            {lesson.locked ? (
                                <div className="flex items-center gap-3 p-4 opacity-50">
                                    <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                                        {index + 1}
                                    </span>
                                    <span>{lesson.title}</span>
                                    <span className="ml-auto text-xs text-slate-500">Locked</span>
                                </div>
                            ) : (
                                <Link
                                    href={route('learn.lessons.show', [course.id, lesson.id])}
                                    className="flex items-center gap-3 p-4 hover:bg-slate-900/50"
                                >
                                    <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                                        {index + 1}
                                    </span>
                                    <span>{lesson.title}</span>
                                    {lesson.freePreview && !enrolled && (
                                        <span className="ml-auto text-xs text-sky-400">Preview</span>
                                    )}
                                </Link>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </AppLayout>
    );
}
