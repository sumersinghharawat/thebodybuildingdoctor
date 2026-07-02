import PdfDownloadLink from '@/Components/PdfDownloadLink';
import ContentVideoPlayer from '@/Components/ContentVideoPlayer';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function LearnCourse({ course, enrolled, lessons }) {
    return (
        <AppLayout>
            <Head title={course.title} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                <Link href={route('learn.index')} className="text-sm text-slate-400 hover:text-slate-200">
                    ← All courses
                </Link>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                {course.descriptionHtml ? (
                    <div
                        className="rich-content text-sm text-slate-400"
                        dangerouslySetInnerHTML={{ __html: course.descriptionHtml }}
                    />
                ) : (
                    <p className="text-sm text-slate-400">{course.description}</p>
                )}

                <ContentVideoPlayer videoUrl={course.videoUrl} title={course.title} />

                <PdfDownloadLink url={course.pdfUrl} label="Download course PDF" />

                {!enrolled && (
                    <p className="text-sm text-slate-400">
                        Enrollment is managed by an administrator.{' '}
                        <Link href="/#apply" className="text-amber-400 hover:underline">
                            Request access
                        </Link>
                    </p>
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
