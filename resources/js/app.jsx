import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { syncCsrfToken } from '@/lib/csrf';
import { setSiteCurrency } from '@/lib/format';
import { installMediaLinkProtection } from '@/lib/media-protection';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function syncPageProps(page) {
    setSiteCurrency(page?.props?.site?.currency);
    syncCsrfToken(page?.props?.csrf_token);
}

router.on('success', (event) => {
    syncPageProps(event.detail.page);
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        syncPageProps(props.initialPage);
        installMediaLinkProtection();
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
