import { useState } from "react";
import { DeviceStorage } from "@/services/storage/device-storage";
import { QueueStorage } from "@/services/storage/queue-storage";
import { useAppStore } from "@/stores/app-store";

const API_BASE = "https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net";

export function useScanSubmit() {
  const { isOnline, setQueueCount } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const submitAttendance = async (qrToken: string) => {
    const device = DeviceStorage.get();

    if (!device) {
      setError("Dispositivo não registrado");
      return;
    }

    const payload = {
      device_id: device.id,
      qr_token: qrToken,
      location: {
        latitude: device.latitude || 0,
        longitude: device.longitude || 0,
      },
      device_time: new Date().toISOString(),
      student_cpf: device.studentCpf,
    };

    try {
      setLoading(true);
      setError(null);

      if (!isOnline) {
        QueueStorage.add(payload);
        setQueueCount(QueueStorage.count());
        setResult({ status: "queued", message: "Presença salva offline" });
        return;
      }

      const response = await fetch(`${API_BASE}/events/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erro ${response.status}: ${text}`);
      }

      const data = await response.json();
      setResult(data);
      setQueueCount(QueueStorage.count());
    } catch (err: any) {
      console.error("Falha ao registrar presença:", err);
      setError(err.message || "Falha ao registrar presença");
    } finally {
      setLoading(false);
    }
  };

  return { submitAttendance, loading, result, error };
}
