import AdminShell from '@/Components/Admin/AdminShell';
import { deleteEnrollment, fetchCourses, fetchEnrollments, fetchUsers } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function EnrollmentsIndex() {
    const [enrollments, setEnrollments] = useState([]);
    const [users, setUsers] = useState({});
    const [courses, setCourses] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchEnrollments(), fetchUsers(), fetchCourses()])
            .then(([enrollmentData, userData, courseData]) => {
                setEnrollments(enrollmentData.enrollments);
                setUsers(Object.fromEntries(userData.users.map((u) => [u.uid, u])));
                setCourses(Object.fromEntries(courseData.courses.map((c) => [c.id, c])));
            })
            .finally(() => setLoading(false));
    }, []);

    async function revoke(enrollment) {
        if (!confirm('Revoke this enrollment?')) return;
        await deleteEnrollment(enrollment.uid, enrollment.courseId);
        setEnrollments((prev) => prev.filter((e) => e.uid !== enrollment.uid || e.courseId !== enrollment.courseId));
    }

    return (
        <AdminShell
            title="Enrollments"
            actions={
                <Link href={route('admin.enrollments.create')} className="btn-primary">
                    Grant enrollment
                </Link>
            }
        >
            <Head title="Enrollments" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                        <article key={`${enrollment.uid}_${enrollment.courseId}`} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium">{users[enrollment.uid]?.name || enrollment.uid}</p>
                                <p className="text-sm text-slate-400">{courses[enrollment.courseId]?.title || enrollment.courseId}</p>
                                <p className="text-xs text-slate-500">
                                    {enrollment.status} · {enrollment.source}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.enrollments.edit', [enrollment.uid, enrollment.courseId])} className="btn-secondary">
                                    Edit
                                </Link>
                                <button type="button" className="btn-secondary text-red-300" onClick={() => revoke(enrollment)}>
                                    Revoke
                                </button>
                            </div>
                        </article>
                    ))}
                    {enrollments.length === 0 && <p className="text-sm text-slate-400">No enrollments yet.</p>}
                </div>
            )}
        </AdminShell>
    );
}
