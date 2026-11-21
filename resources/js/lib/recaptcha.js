let scriptPromise = null;

function loadRecaptchaScript(siteKey) {
    if (typeof window === 'undefined' || !siteKey) {
        return Promise.reject(new Error('reCAPTCHA is not configured.'));
    }

    if (window.grecaptcha?.execute) {
        return Promise.resolve(window.grecaptcha);
    }

    if (!scriptPromise) {
        scriptPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-recaptcha="v3"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.grecaptcha));
                existing.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA.')));
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
            script.async = true;
            script.defer = true;
            script.dataset.recaptcha = 'v3';
            script.onload = () => resolve(window.grecaptcha);
            script.onerror = () => reject(new Error('Failed to load reCAPTCHA.'));
            document.head.appendChild(script);
        });
    }

    return scriptPromise;
}

export async function executeRecaptcha(siteKey, action = 'inquiry') {
    const grecaptcha = await loadRecaptchaScript(siteKey);

    return new Promise((resolve, reject) => {
        grecaptcha.ready(async () => {
            try {
                const token = await grecaptcha.execute(siteKey, { action });
                if (!token) {
                    reject(new Error('Empty reCAPTCHA token.'));
                    return;
                }
                resolve(token);
            } catch (error) {
                reject(error);
            }
        });
    });
}
