export function setSiteCurrency(currencyCode) {
    if (currencyCode) {
        siteCurrency = currencyCode;
    }
}

export function getSiteCurrency() {
    return siteCurrency;
}

let siteCurrency = 'EUR';

export function formatPrice(cents, currencyCode = siteCurrency) {
    if (cents === 0) {
        return 'Free';
    }

    try {
        return new Intl.NumberFormat('en', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: Number.isInteger(cents / 100) ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(cents / 100);
    } catch {
        return `${currencyCode} ${(cents / 100).toFixed(2)}`;
    }
}

export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
