import { useState } from 'react';
import { toast } from 'sonner';
import { submitScan } from '../api/scan-api';
import { DeviceStorage } from '@/services/storage/device-storage';
import { QueueStorage } from '@/services/storage/queue-storage';
import { getCurrentLocation } from '@/shared/utils/geolocation';
import { useAppStore } from '@/app/store/app-store';
import { ScanRequest } from '@/shared/types';

export function useScanSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isOnline, setQueueCount } = useAppStore();

  const submit = async (qrToken: string): Promise<boolean> => {
    if (isSubmitting) return false;

    setIsSubmitting(true);

    try {
      // Get device ID
      const deviceData = DeviceStorage.get();
      if (!deviceData) {
        toast.error('Device not registered');
        return false;
      }

      // Get location
      let location;
      try {
        location = await getCurrentLocation();
      } catch (error: any) {
        toast.error(error.message);
        return false;
      }

      // Prepare scan data
      const scanData: ScanRequest = {
        qr_token: qrToken,
        device_id: deviceData.device_id,
        location,
        device_time: new Date().toISOString(),
      };

      // Try to submit
      if (isOnline) {
        try {
          const response = await submitScan(scanData);
          toast.success(response.message || 'Attendance registered successfully!');
          return true;
        } catch (error: any) {
          // If online but request failed, queue it
          QueueStorage.add({ data: scanData });
          setQueueCount(QueueStorage.count());
          toast.warning('Saved offline - will sync when connection is restored');
          return false;
        }
      } else {
        // Offline - queue immediately
        QueueStorage.add({ data: scanData });
        setQueueCount(QueueStorage.count());
        toast.info('You\'re offline - attendance will be synced later');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
}
