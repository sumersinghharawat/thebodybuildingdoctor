import { formatPrice } from '@/lib/format';
import CourseRequestButton from '@/Components/CourseRequestButton';

export default function CourseCard({ course, showRequest = true }) {
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-edge bg-surface transition hover:border-faint">
            {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
            ) : (
                <div className="aspect-video w-full bg-surface-hover" />
            )}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    {course.level && (
                        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                            {course.level}
                        </span>
                    )}
                    {course.category && (
                        <span className="rounded-full bg-surface-hover/60 px-2 py-0.5 text-[10px] text-muted">
                            {course.category}
                        </span>
                    )}
                </div>
                <h3 className="font-semibold leading-snug">{course.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs text-muted">{course.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-edge pt-3">
                    <span className="text-sm font-semibold text-accentSoft">{formatPrice(course.priceCents)}</span>
                    {course.lessonCount > 0 && (
                        <span className="text-xs text-faint">
                            {course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}
                        </span>
                    )}
                </div>
                {showRequest && (
                    <div className="mt-3">
                        <CourseRequestButton course={course} compact />
                    </div>
                )}
            </div>
        </article>
    );
}
