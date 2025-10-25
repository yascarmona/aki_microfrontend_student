import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRScanner } from '../components/QRScanner';
import { useScanSubmit } from '../hooks/useScanSubmit';
import { DeviceStorage } from '@/services/storage/device-storage';
import { useAppStore } from '@/app/store/app-store';
import { QueueStorage } from '@/services/storage/queue-storage';
import { WifiOff, Wifi, QrCode, LogOut, RefreshCw } from 'lucide-react';

export default function ScanPage() {
  const navigate = useNavigate();
  const { submit, isSubmitting } = useScanSubmit();
  const { isOnline, queueCount, setOnline, setQueueCount } = useAppStore();
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    // Check if device is registered
    if (!DeviceStorage.isRegistered()) {
      navigate('/register-device');
      return;
    }

    // Set up online/offline listeners
    const handleOnline = () => {
      setOnline(true);
      syncQueue();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial queue count
    setQueueCount(QueueStorage.count());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, setOnline, setQueueCount]);

  const handleScan = async (data: string) => {
    if (data === lastScan) return; // Prevent duplicate scans
    
    setLastScan(data);
    const success = await submit(data);
    
    // Reset after 3 seconds to allow rescanning
    setTimeout(() => setLastScan(null), 3000);
  };

  const syncQueue = async () => {
    const queue = QueueStorage.getAll();
    if (queue.length === 0) return;

    // Try to sync queued scans (simplified - in production, add proper retry logic)
    setQueueCount(queue.length);
  };

  const handleLogout = () => {
    DeviceStorage.clear();
    navigate('/register-device');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 pb-8">
      <div className="max-w-md mx-auto space-y-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">AKI!</h1>
            <p className="text-sm text-muted-foreground">Attendance System</p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="gap-2">
                <Wifi className="w-4 h-4" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-2">
                <WifiOff className="w-4 h-4" />
                Offline
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Queue indicator */}
        {queueCount > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-warning" />
                <div>
                  <p className="font-medium text-warning-foreground">
                    {queueCount} pending sync{queueCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Will sync when online
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scanner Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Scan QR Code</CardTitle>
            <CardDescription>
              Point your camera at the attendance QR code
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <QRScanner onScan={handleScan} isScanning={isSubmitting} />
            
            {isSubmitting && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground animate-pulse">
                  Processing attendance...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Position the QR code within the frame to register your attendance.
            Make sure GPS is enabled for accurate location tracking.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
