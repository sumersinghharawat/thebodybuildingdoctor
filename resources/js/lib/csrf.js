export function getCsrfToken() {
    const meta = document.head.querySelector('meta[name="csrf-token"]');
    if (meta?.content) {
        return meta.content;
    }

    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function syncCsrfToken(token) {
    if (!token) {
        return;
    }

    let meta = document.head.querySelector('meta[name="csrf-token"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'csrf-token');
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', token);

    if (window.axios) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
}
