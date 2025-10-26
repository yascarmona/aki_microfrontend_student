import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card } from '@/components/ui/card';
import { Camera, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);


  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setError(null);
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission denied. Please enable camera access.');
    }
  };

  useEffect(() => {
    (async () => {
      await checkCameraPermission();
    })();
  }, []);

  const handleScan = (detectedCodes: Array<{ rawValue: string }>) => {
    if (detectedCodes && detectedCodes.length > 0 && !isScanning) {
      onScan(detectedCodes[0].rawValue);
    }
  };

  const handleError = (error: Error) => {
    console.error('QR Scanner error:', error);
  };

  if (hasPermission === false || error) {
    return (
      <Card className="w-full aspect-square flex flex-col items-center justify-center p-8 bg-muted/50 border-2 border-dashed">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <p className="text-center text-muted-foreground">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden border-4 border-primary shadow-lg relative">
      <div className="aspect-square relative">
        {hasPermission === true ? (
          <>
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-4 border-primary rounded-2xl scan-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 border-t-4 border-l-4 border-primary absolute -top-8 -left-8 rounded-tl-xl" />
                <div className="w-16 h-16 border-t-4 border-r-4 border-primary absolute -top-8 -right-8 rounded-tr-xl" />
                <div className="w-16 h-16 border-b-4 border-l-4 border-primary absolute -bottom-8 -left-8 rounded-bl-xl" />
                <div className="w-16 h-16 border-b-4 border-r-4 border-primary absolute -bottom-8 -right-8 rounded-br-xl" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
