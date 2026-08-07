/**
 * Soft client-side DevTools deterrent.
 * Can be bypassed — not real security.
 *
 * Intentionally skipped on phones/tablets: mobile browsers often report large
 * outer/inner viewport gaps (address bar, toolbars), which falsely triggers
 * the old size heuristic and blocks the site with “Access blocked”.
 */

const OVERLAY_ID = 'tbbd-devtools-guard';

function isMobileOrTouchClient() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return true;
    }

    const ua = navigator.userAgent || '';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
        return true;
    }

    // iPadOS / tablets that spoof desktop Safari still expose touch.
    if (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) {
        return true;
    }

    try {
        if (window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(hover: none)').matches) {
            return true;
        }
        if (window.matchMedia('(max-width: 768px)').matches && navigator.maxTouchPoints > 0) {
            return true;
        }
    } catch {
        // matchMedia unavailable — fall through
    }

    return false;
}

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
    const outerW = window.outerWidth || 0;
    const outerH = window.outerHeight || 0;
    const innerW = window.innerWidth || 0;
    const innerH = window.innerHeight || 0;

    // Mobile / embedded browsers often report 0 outer sizes — ignore those.
    if (outerW < 100 || outerH < 100) {
        return false;
    }

    const widthGap = Math.abs(outerW - innerW);
    const heightGap = Math.abs(outerH - innerH);

    // Docked DevTools usually open a large side or bottom panel.
    // Browser chrome alone is typically well under these thresholds on desktop.
    return widthGap > 200 || heightGap > 220;
}

export function installDevToolsGuard() {
    if (typeof window === 'undefined' || window.__tbbdDevToolsGuardInstalled) {
        return;
    }

    // Only enforce on production builds so local `npm run dev` stays usable.
    if (!import.meta.env.PROD) {
        return;
    }

    // Never block phones/tablets — false positives are common and break browsing.
    if (isMobileOrTouchClient()) {
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
            setLocked(detectByViewport());
        } catch {
            // Fail open — never lock the site because detection threw.
            setLocked(false);
        }
    }

    check();
    window.setInterval(check, 1500);
    window.addEventListener('resize', check);
}
