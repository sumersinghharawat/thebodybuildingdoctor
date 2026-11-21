import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

let sharedWorker = null;

function ensurePdfWorker() {
    if (sharedWorker) {
        return;
    }

    // Vite ?worker creates a blob worker — avoids nginx MIME issues with .mjs assets.
    sharedWorker = new PdfJsWorker();
    pdfjs.GlobalWorkerOptions.workerPort = sharedWorker;
}

ensurePdfWorker();

export default function BookPdfViewer({ src, title }) {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let pdfDoc = null;

        async function render() {
            setLoading(true);
            setError(null);
            setPageCount(0);

            try {
                ensurePdfWorker();

                const loadingTask = pdfjs.getDocument({
                    url: src,
                    withCredentials: true,
                });
                pdfDoc = await loadingTask.promise;
                if (cancelled) {
                    pdfDoc.destroy();
                    return;
                }

                setPageCount(pdfDoc.numPages);
                const host = containerRef.current;
                if (!host) return;
                host.innerHTML = '';

                for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber += 1) {
                    if (cancelled) break;

                    const page = await pdfDoc.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const width = Math.max(host.clientWidth || 800, 320);
                    const scale = Math.min(width / baseViewport.width, 2);
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.className = 'mb-4 w-full max-w-full rounded-lg bg-white shadow';
                    canvas.style.userSelect = 'none';
                    canvas.setAttribute('draggable', 'false');

                    const context = canvas.getContext('2d', { alpha: false });
                    await page.render({ canvasContext: context, viewport }).promise;
                    if (!cancelled) {
                        host.appendChild(canvas);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err?.message || 'Unable to load book PDF.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void render();

        return () => {
            cancelled = true;
            if (pdfDoc) {
                pdfDoc.destroy();
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [src]);

    useEffect(() => {
        function block(event) {
            event.preventDefault();
            event.stopPropagation();
        }

        function blockKeys(event) {
            const key = event.key?.toLowerCase();
            const blocked = (event.ctrlKey || event.metaKey) && ['s', 'p', 'u'].includes(key);
            if (blocked) {
                event.preventDefault();
                event.stopPropagation();
            }
        }

        const node = containerRef.current?.parentElement;
        document.addEventListener('contextmenu', block, true);
        document.addEventListener('dragstart', block, true);
        document.addEventListener('keydown', blockKeys, true);
        node?.addEventListener('selectstart', block, true);

        return () => {
            document.removeEventListener('contextmenu', block, true);
            document.removeEventListener('dragstart', block, true);
            document.removeEventListener('keydown', blockKeys, true);
            node?.removeEventListener('selectstart', block, true);
        };
    }, []);

    return (
        <div
            className="book-pdf-viewer relative h-full overflow-auto rounded-lg border border-edge bg-surface p-3 md:p-4"
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
            {loading && (
                <p className="py-10 text-center text-sm text-muted">Loading “{title}”…</p>
            )}
            {error && <p className="py-10 text-center text-sm text-red-300">{error}</p>}
            <div ref={containerRef} className="mx-auto max-w-4xl" />
            {!loading && !error && pageCount > 0 && (
                <p className="mt-2 text-center text-xs text-faint">{pageCount} pages</p>
            )}
        </div>
    );
}
