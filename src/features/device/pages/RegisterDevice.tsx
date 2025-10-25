import { useState } from 'react';
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
import { registerDevice } from '../api/device-api';
import { DeviceStorage } from '@/services/storage/device-storage';
import { validateCPF } from '@/shared/utils/validators';

const deviceSchema = z.object({
  cpf: z.string().refine((val) => validateCPF(val), {
    message: 'CPF inválido',
  }),
});

type DeviceFormData = z.infer<typeof deviceSchema>;

export default function RegisterDevice() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: { cpf: '' },
  });

  const cpf = watch('cpf');

  const onSubmit = async (data: DeviceFormData) => {
    setIsLoading(true);
    try {
      const deviceId = DeviceStorage.getDeviceId();
      const response = await registerDevice({
        cpf: data.cpf,
        device_id: deviceId,
      });

      DeviceStorage.save({
        device_id: deviceId,
        cpf: data.cpf,
        registered_at: new Date().toISOString(),
      });

      toast.success(response.message || 'Device successfully linked!');
      navigate('/scan');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register device');
    } finally {
      setIsLoading(false);
    }
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
                onChange={(value) => setValue('cpf', value)}
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
