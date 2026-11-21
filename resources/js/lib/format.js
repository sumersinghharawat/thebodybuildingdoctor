export function setSiteCurrency(currencyCode) {
    // Site is INR-only; ignore other codes.
    siteCurrency = 'INR';
}

export function getSiteCurrency() {
    return siteCurrency;
}

let siteCurrency = 'INR';

export function formatPrice(cents, currencyCode = 'INR') {
    if (cents === 0) {
        return 'Free';
    }

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: Number.isInteger(cents / 100) ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(cents / 100);
    } catch {
        return `₹ ${(cents / 100).toFixed(2)}`;
    }
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
