import AdminShell from '@/Components/Admin/AdminShell';
import {
    createEnrollment,
    fetchCourses,
    fetchEnrollment,
    fetchUsers,
    updateEnrollment,
} from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function EnrollmentForm({ uid, courseId, prefillEmail = '', returnTo = null }) {
    const isEdit = Boolean(uid && courseId);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({ uid: uid || '', courseId: courseId || '', status: 'active', source: 'admin', expiresAt: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchUsers(), fetchCourses()]).then(([userData, courseData]) => {
            setUsers(userData.users);
            setCourses(courseData.courses);

            if (!isEdit && prefillEmail) {
                const match = userData.users.find(
                    (user) => user.email.toLowerCase() === prefillEmail.toLowerCase(),
                );
                if (match) {
                    setForm((prev) => ({ ...prev, uid: match.uid }));
                }
            }
        });
        if (isEdit) {
            fetchEnrollment(uid, courseId).then((data) => {
                setForm({
                    uid: data.enrollment.uid,
                    courseId: data.enrollment.courseId,
                    status: data.enrollment.status,
                    source: data.enrollment.source,
                    expiresAt: data.enrollment.expiresAt ? data.enrollment.expiresAt.slice(0, 10) : '',
                });
            });
        }
    }, [uid, courseId, isEdit, prefillEmail]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                expiresAt: form.expiresAt || null,
            };
            if (isEdit) {
                await updateEnrollment(uid, courseId, payload);
            } else {
                await createEnrollment(payload);
            }
            router.visit(returnTo || route('admin.enrollments.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit enrollment' : 'Grant enrollment'}>
            <Head title="Enrollment" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div>
                    <label className="label-dark">User</label>
                    <select className="input-dark" value={form.uid} onChange={(e) => setForm((p) => ({ ...p, uid: e.target.value }))} required disabled={isEdit}>
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.uid} value={user.uid}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Course</label>
                    <select className="input-dark" value={form.courseId} onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))} required disabled={isEdit}>
                        <option value="">Select course</option>
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Status</label>
                    <select className="input-dark" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Expires at</label>
                    <input className="input-dark" type="date" value={form.expiresAt} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={returnTo || route('admin.enrollments.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
