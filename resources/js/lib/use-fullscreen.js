import { useCallback, useEffect, useState } from 'react';

function getFullscreenElement() {
    return document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
}

function requestFullscreen(element) {
    if (element.requestFullscreen) {
        return element.requestFullscreen();
    }

    if (element.webkitRequestFullscreen) {
        return element.webkitRequestFullscreen();
    }

    return Promise.reject(new Error('Fullscreen not supported'));
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        return document.exitFullscreen();
    }

    if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen();
    }

    return Promise.reject(new Error('Fullscreen not supported'));
}

export function useFullscreen() {
    const [element, setElement] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const containerRef = useCallback((node) => {
        setElement(node);
    }, []);

    useEffect(() => {
        const sync = () => {
            setIsFullscreen(getFullscreenElement() === element);
        };

        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);

        return () => {
            document.removeEventListener('fullscreenchange', sync);
            document.removeEventListener('webkitfullscreenchange', sync);
        };
    }, [element]);

    const toggleFullscreen = useCallback(
        (event) => {
            event?.stopPropagation();
            event?.preventDefault();

            if (!element) {
                return;
            }

            if (getFullscreenElement() === element) {
                exitFullscreen().catch(() => {});
                return;
            }

            requestFullscreen(element).catch(() => {});
        },
        [element],
    );

    return { containerRef, isFullscreen, toggleFullscreen };
}
