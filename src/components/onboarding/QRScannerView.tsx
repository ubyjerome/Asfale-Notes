import { useRef, useEffect, useState } from 'react';
import { GoCodescan } from 'react-icons/go';

interface QRScannerViewProps {
  onScan: (data: string) => void;
  onBack: () => void;
  validate: (data: string) => boolean;
}

export function QRScannerView({ onScan, onBack, validate }: QRScannerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);
      } catch {
        if (active) setError('Camera access denied or unavailable.');
      }
    };

    start();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let active = true;

    const scan = () => {
      if (!active) return;
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scan);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      import('jsqr').then(({ default: jsQR }) => {
        if (!active) return;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const phrase = code.data.trim().toLowerCase();
          if (validate(phrase)) {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((t) => t.stop());
              streamRef.current = null;
            }
            onScan(phrase);
            return;
          }
          setError('Scanned code is not a valid recovery phrase.');
        }
        requestAnimationFrame(scan);
      });
    };

    requestAnimationFrame(scan);

    return () => {
      active = false;
    };
  }, [scanning, validate, onScan]);

  return (
    <div className="flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-medium text-[var(--color-ink)] mb-2 text-center">
          Scan QR Code
        </h2>
        <p className="text-sm text-[var(--color-body)] mb-6 text-center">
          Point your camera at the QR code on the other device.
        </p>

        <div className="relative rounded-radius-lg overflow-hidden bg-black aspect-[4/3] mb-4">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-2 border-[var(--color-primary)] rounded-radius-lg pointer-events-none" />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <p className="text-white text-sm text-center px-4">{error}</p>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 h-12 text-sm font-medium text-[var(--color-ink)] bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-radius-lg"
        >
          <GoCodescan className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
