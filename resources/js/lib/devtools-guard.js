/**
 * Soft client-side DevTools deterrent for the whole site.
 * Can be bypassed — not real security.
 */

const OVERLAY_ID = 'tbbd-devtools-guard';

function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('role', 'alert');
    overlay.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'z-index:2147483647',
        'align-items:center',
        'justify-content:center',
        'padding:24px',
        'background:rgba(2,6,23,0.97)',
        'color:#fecaca',
        'font-family:system-ui,-apple-system,sans-serif',
        'text-align:center',
    ].join(';');

    overlay.innerHTML = `
        <div style="max-width:28rem">
            <p style="margin:0 0 0.75rem;font-size:1.35rem;font-weight:700;color:#fecaca">Access blocked</p>
            <p style="margin:0;font-size:0.95rem;line-height:1.6;color:rgba(254,202,202,0.85)">
                Developer tools are open. Close DevTools and refresh the page to continue using the site.
            </p>
        </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
}

function showOverlay(visible) {
    const overlay = ensureOverlay();
    overlay.style.display = visible ? 'flex' : 'none';
    document.documentElement.style.overflow = visible ? 'hidden' : '';
    document.body.style.overflow = visible ? 'hidden' : '';
}

function detectByViewport() {
    const widthGap = Math.abs(window.outerWidth - window.innerWidth);
    const heightGap = Math.abs(window.outerHeight - window.innerHeight);
    return widthGap > 160 || heightGap > 160;
}

function detectByDebugger() {
    const start = performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    return performance.now() - start > 100;
}

export function installDevToolsGuard() {
    if (typeof window === 'undefined' || window.__tbbdDevToolsGuardInstalled) {
        return;
    }

    // Only enforce on production builds so local `npm run dev` stays usable.
    if (!import.meta.env.PROD) {
        return;
    }

    window.__tbbdDevToolsGuardInstalled = true;

    let locked = false;

    function setLocked(next) {
        if (locked === next) {
            return;
        }
        locked = next;
        showOverlay(next);
    }

    function check() {
        try {
            if (detectByViewport() || detectByDebugger()) {
                setLocked(true);
                return;
            }
            setLocked(false);
        } catch {
            setLocked(true);
        }
    }

    check();
    window.setInterval(check, 1500);
    window.addEventListener('resize', check);
}
