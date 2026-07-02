export function formatPrice(cents) {
    if (cents === 0) return 'Free';
    return `€${(cents / 100).toFixed(0)}`;
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
