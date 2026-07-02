import LessonVideoPlayer from '@/Components/LessonVideoPlayer';
import PdfDownloadLink from '@/Components/PdfDownloadLink';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function LearnLesson({ course, lesson, prevLesson, nextLesson }) {
    return (
        <AppLayout>
            <Head title={lesson.title} />
            <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                <Link
                    href={route('learn.courses.show', course.id)}
                    className="text-sm text-slate-400 hover:text-slate-200"
                >
                    ← {course.title}
                </Link>
                <h1 className="text-2xl font-bold">{lesson.title}</h1>

                <LessonVideoPlayer courseId={course.id} lessonId={lesson.id} title={lesson.title} />

                <PdfDownloadLink url={lesson.pdfUrl} label="Download lesson PDF" />

                {lesson.contentHtml && (
                    <div
                        className="rich-content rounded-xl border border-slate-800 bg-slate-900 p-6"
                        dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                    />
                )}

                <nav className="flex gap-3 pt-4 border-t border-slate-800">
                    {prevLesson && (
                        <Link
                            href={route('learn.lessons.show', [course.id, prevLesson.id])}
                            className="flex-1 rounded-xl border border-slate-800 p-4 hover:border-slate-600"
                        >
                            <p className="text-xs text-slate-500">Previous</p>
                            <p className="text-sm font-medium truncate">{prevLesson.title}</p>
                        </Link>
                    )}
                    {nextLesson && (
                        <Link
                            href={route('learn.lessons.show', [course.id, nextLesson.id])}
                            className="flex-1 rounded-xl border border-slate-800 p-4 hover:border-slate-600 text-right"
                        >
                            <p className="text-xs text-slate-500">Next</p>
                            <p className="text-sm font-medium truncate">{nextLesson.title}</p>
                        </Link>
                    )}
                </nav>
            </div>
        </AppLayout>
    );
}
