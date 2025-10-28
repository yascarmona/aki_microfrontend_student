import { useState, createContext, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Smartphone, Loader2 } from 'lucide-react';
import { CPFInput } from '../components/CPFInput';
import { registerDevice as registerDeviceApi } from '../api/device-api';
import { DeviceStorage } from '@/services/storage/device-storage';
import { validateCPF } from '@/shared/utils/validators';

const deviceSchema = z.object({
  cpf: z.string().refine((val) => validateCPF(val), {
    message: 'CPF inválido',
  }),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

// New: Device context types
type DeviceContextType = {
  isLoading: boolean;
  registerDevice: (cpf: string) => Promise<{ success: boolean; pending?: boolean; message?: string }>;
};

// New: typed device record for storage
type DeviceRecord = {
  device_id: string;
  cpf: string;
  registered_at: string;
  pending_sync?: boolean;
};

// New: Create context
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// New: Provider that encapsulates registration logic
function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const registerDevice = async (cpf: string) => {
    setIsLoading(true);

    const normalizedCpf = cpf.replace(/\D/g, '');
    const deviceId =
      DeviceStorage.getDeviceId() ??
      (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
        ? (crypto as any).randomUUID()
        : `device-${Date.now()}`);

    try {
      const response = await registerDeviceApi({
        cpf: normalizedCpf,
        device_id: deviceId,
      });

      DeviceStorage.save({
        device_id: deviceId,
        cpf: normalizedCpf,
        registered_at: new Date().toISOString(),
      });

      toast.success(response?.message || 'Device successfully linked!');
      return { success: true, message: response?.message };
    } catch (err: unknown) {
      const errMessage = err && typeof err === 'object' && 'message' in err ? (err as any).message : '';
      const isNetworkError =
        (typeof errMessage === 'string' && errMessage.toLowerCase().includes('network')) ||
        err instanceof TypeError;

      if (isNetworkError) {
        // Use typed record and remove "as any" cast
        const pendingRecord: DeviceRecord = {
          device_id: deviceId,
          cpf: normalizedCpf,
          registered_at: new Date().toISOString(),
          pending_sync: true,
        };

        DeviceStorage.save(pendingRecord);

        toast('Network error detected. Device saved locally and will be synced when online.', {
          icon: '💾',
        });

        return { success: false, pending: true, message: 'Saved locally (pending sync)' };
      } else {
        const message =
          err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
            ? (err as any).message
            : 'Failed to register device';
        toast.error(message);
        return { success: false, message };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(() => ({ isLoading, registerDevice }), [isLoading]);

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

// New: hook to consume context
function useDeviceContext() {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error('useDeviceContext must be used within DeviceProvider');
  return ctx;
}

// Rename original component implementation to consume context
function RegisterDeviceContent() {
  const navigate = useNavigate();

  const { isLoading, registerDevice } = useDeviceContext();

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    // default mock CPF for testing (change/remove in production)
    defaultValues: { cpf: '111.444.777-35' },
  });

  const cpf = watch('cpf');

  const onSubmit = async (data: DeviceFormData) => {
    // delegate registration to context
    const result = await registerDevice(data.cpf);

    // navigate on success or on pending network save so user can continue
    if (result.success || result.pending) {
      navigate('/scan');
    }
    // errors are already handled with toasts inside the provider
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">AKI!</CardTitle>
          <CardDescription className="text-base">
            Register your device to start recording attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-base font-medium">
                CPF
              </Label>
              <CPFInput
                id="cpf"
                value={cpf}
                onChange={(value) =>
                  // force validation/touch on change so errors update immediately
                  setValue('cpf', value, { shouldValidate: true, shouldTouch: true })
                }
                disabled={isLoading}
              />
              {errors.cpf && (
                <p className="text-sm text-destructive animate-in slide-in-from-top-1">
                  {errors.cpf.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Export wrapper that provides the context
export default function RegisterDevice() {
  return (
    <DeviceProvider>
      <RegisterDeviceContent />
    </DeviceProvider>
  );
}
