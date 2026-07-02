function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

async function adminFetch(path, init = {}) {
    const headers = {
        Accept: 'application/json',
        ...init.headers,
    };

    if (!(init.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((init.method || 'GET').toUpperCase())) {
        headers['X-XSRF-TOKEN'] = getCsrfToken();
    }

    const res = await fetch(path, {
        credentials: 'same-origin',
        ...init,
        headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message =
            (typeof data.message === 'string' && data.message) ||
            (data.errors && Object.values(data.errors)[0]?.[0]) ||
            'Request failed';
        throw new Error(message);
    }

    return data;
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export { formatPrice } from '@/lib/format';

export function fetchCourses() {
    return adminFetch('/api/admin/courses');
}

export async function fetchCourse(id) {
    return adminFetch(`/api/admin/courses/${id}`);
}

export async function createCourse(body) {
    const data = await adminFetch('/api/admin/courses', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return data.course;
}

export async function updateCourse(id, body) {
    const data = await adminFetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
    return data.course;
}

export function deleteCourse(id) {
    return adminFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
}

export async function createLesson(courseId, body) {
    const data = await adminFetch(`/api/admin/courses/${courseId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return data.lesson;
}

export async function updateLesson(courseId, lessonId, body) {
    const data = await adminFetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
    return data.lesson;
}

export function deleteLesson(courseId, lessonId) {
    return adminFetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
}

export function reorderLessons(courseId, lessonIds) {
    return adminFetch(`/api/admin/courses/${courseId}/lessons/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ lessonIds }),
    });
}

export function fetchEnrollments(params = {}) {
    const search = new URLSearchParams();
    if (params.uid) search.set('uid', params.uid);
    if (params.courseId) search.set('courseId', params.courseId);
    const qs = search.toString();
    return adminFetch(`/api/admin/enrollments${qs ? `?${qs}` : ''}`);
}

export function fetchEnrollment(uid, courseId) {
    return adminFetch(`/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}`);
}

export function createEnrollment(body) {
    return adminFetch('/api/admin/enrollments', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function updateEnrollment(uid, courseId, body) {
    return adminFetch(
        `/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}`,
        { method: 'PATCH', body: JSON.stringify(body) },
    );
}

export function deleteEnrollment(uid, courseId) {
    return adminFetch(
        `/api/admin/enrollments/${encodeURIComponent(uid)}/${encodeURIComponent(courseId)}`,
        { method: 'DELETE' },
    );
}

export function fetchUsers() {
    return adminFetch('/api/admin/users');
}

export async function fetchUser(uid) {
    const data = await adminFetch(`/api/admin/users/${uid}`);
    return data.user;
}

export async function createUser(body) {
    const data = await adminFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
            email: body.email,
            password: body.password,
            name: body.name || body.displayName,
            roles: body.roles || (body.role ? [body.role] : ['media_channel']),
        }),
    });
    return data.user;
}

export async function updateUser(uid, body) {
    const data = await adminFetch(`/api/admin/users/${uid}`, {
        method: 'PATCH',
        body: JSON.stringify({
            email: body.email,
            password: body.password || undefined,
            name: body.name || body.displayName,
            roles: body.roles,
        }),
    });
    return data.user;
}

export function deleteUser(uid) {
    return adminFetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
}

export function fetchMentorship() {
    return adminFetch('/api/admin/mentorship');
}

export async function fetchMentorshipItem(id) {
    return adminFetch(`/api/admin/mentorship/${id}`);
}

export async function createMentorship(body) {
    const data = await adminFetch('/api/admin/mentorship', {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return data.mentorship;
}

export async function updateMentorship(id, body) {
    const data = await adminFetch(`/api/admin/mentorship/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
    return data.mentorship;
}

export function deleteMentorship(id) {
    return adminFetch(`/api/admin/mentorship/${id}`, { method: 'DELETE' });
}

export function fetchMentorshipAccessList() {
    return adminFetch('/api/admin/mentorship-access').then((data) => ({
        mentorshipAccess: data.grants || data.mentorshipAccess || [],
    }));
}

export async function fetchMentorshipAccess(uid) {
    return adminFetch(`/api/admin/mentorship-access/${encodeURIComponent(uid)}`);
}

export function grantMentorshipAccess(body) {
    return adminFetch('/api/admin/mentorship-access', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function updateMentorshipAccess(uid, body) {
    return adminFetch(`/api/admin/mentorship-access/${encodeURIComponent(uid)}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export function deleteMentorshipAccess(uid) {
    return adminFetch(`/api/admin/mentorship-access/${encodeURIComponent(uid)}`, { method: 'DELETE' });
}

export function fetchLandingAppSection() {
    return adminFetch('/api/admin/landing-app').then((data) => data.appSection);
}

export function updateLandingAppSection(body) {
    return adminFetch('/api/admin/landing-app', {
        method: 'PATCH',
        body: JSON.stringify(body),
    }).then((data) => data.appSection);
}

export function fetchGeneralSettings() {
    return adminFetch('/api/admin/settings').then((data) => data.settings);
}

export function updateGeneralSettings(body) {
    return adminFetch('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
    }).then((data) => data.settings);
}

export function fetchInquiries() {
    return adminFetch('/api/admin/inquiries');
}

export function updateInquiry(id, body) {
    return adminFetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export async function uploadPdf(file, folder) {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder === 'mentorship' ? 'mentorship' : folder);

    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
            Accept: 'application/json',
        },
        body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'PDF upload failed');
    }

    return data;
}

export async function uploadApp(file) {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'apps');

    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
            Accept: 'application/json',
        },
        body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'APK upload failed');
    }

    return data;
}

export async function uploadThumbnail(file, folder) {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);

    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-XSRF-TOKEN': getCsrfToken(),
            Accept: 'application/json',
        },
        body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
    }

    return data;
}
