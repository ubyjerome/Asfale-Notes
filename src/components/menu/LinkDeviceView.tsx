import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export function LinkDeviceView() {
  const [mnemonic, setMnemonic] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    import('../../db/prefsRepo').then(({ prefsRepo }) =>
      prefsRepo.get<string>('mnemonic'),
    ).then((m) => {
      if (m) {
        setMnemonic(m);
        QRCode.toDataURL(m, { width: 280, margin: 2 }).then(setQrDataUrl);
      }
    });
  }, []);

  const handleStopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  };

  useEffect(() => {
    if (!showScanner || !videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const scan = async () => {
      if (!videoRef.current || !ctx) return;
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animId = requestAnimationFrame(scan);
        return;
      }
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = await import('jsqr').then((m) => m.default(imageData.data, imageData.width, imageData.height));

      if (code) {
        handleStopScan();
        const phrase = code.data.trim().toLowerCase();
        const { validateMnemonic } = await import('../../crypto/keygen');
        if (validateMnemonic(phrase)) {
          setMnemonic(phrase);
          QRCode.toDataURL(phrase, { width: 280, margin: 2 }).then(setQrDataUrl);
        } else {
          alert('Scanned QR does not contain a valid recovery phrase');
          handleStopScan();
        }
      } else {
        animId = requestAnimationFrame(scan);
      }
    };

    animId = requestAnimationFrame(scan);

    return () => {
      cancelAnimationFrame(animId);
      handleStopScan();
    };
  }, [showScanner]);

  return (
    <div className="p-4 space-y-4">
      <p className="text-sm text-[var(--color-body)]">
        Show this QR code to another device to link it.
      </p>

      <div className="flex justify-center md:justify-start">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR code" className="w-64 h-64 rounded-radius-lg" />
        ) : (
          <div className="w-64 h-64 rounded-radius-lg bg-[var(--color-surface-soft)] flex items-center justify-center text-sm text-[var(--color-muted)]">
            Loading...
          </div>
        )}
      </div>

      {showScanner && (
        <div className="relative rounded-radius-lg overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 border-2 border-[var(--color-primary)] rounded-radius-lg pointer-events-none" />
        </div>
      )}
    </div>
  );
}
