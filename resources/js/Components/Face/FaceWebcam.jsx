import Webcam from 'react-webcam';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

const videoConstraints = {
    facingMode: 'user',
    width: { ideal: 640, min: 320 },
    height: { ideal: 480, min: 240 },
};

const FaceWebcam = forwardRef(function FaceWebcam({ onUserMediaError, className = '' }, ref) {
    const webcamRef = useRef(null);
    const [ready, setReady] = useState(false);

    useImperativeHandle(ref, () => ({
        getVideo() {
            return webcamRef.current?.video ?? null;
        },
        getScreenshot() {
            return webcamRef.current?.getScreenshot() ?? null;
        },
        isReady() {
            return ready && Boolean(webcamRef.current?.video);
        },
    }));

    const handleUserMedia = useCallback(() => {
        setReady(true);
    }, []);

    const handleError = useCallback((error) => {
        setReady(false);
        onUserMediaError?.(error);
    }, [onUserMediaError]);

    return (
        <div className={`relative overflow-hidden rounded-xl border border-slate-700 bg-black ${className}`}>
            <Webcam
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleError}
                className="aspect-[4/3] w-full object-cover"
            />
            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm text-slate-300">
                    Waiting for camera…
                </div>
            )}
        </div>
    );
});

export default FaceWebcam;
