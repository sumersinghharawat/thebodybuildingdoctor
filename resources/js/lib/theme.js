const STORAGE_KEY = 'tbbd-theme';

export function getStoredTheme() {
    try {
        const value = localStorage.getItem(STORAGE_KEY);
        if (value === 'light' || value === 'dark') {
            return value;
        }
    } catch {
        // ignore
    }
    return null;
}

export function getPreferredTheme() {
    return getStoredTheme() || 'dark';
}

export function applyTheme(theme) {
    const next = theme === 'light' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.dataset.theme = next;
    root.style.colorScheme = next;
    try {
        localStorage.setItem(STORAGE_KEY, next);
    } catch {
        // ignore
    }
    return next;
}

export function toggleTheme() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    return applyTheme(current === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
    return applyTheme(getPreferredTheme());
}
