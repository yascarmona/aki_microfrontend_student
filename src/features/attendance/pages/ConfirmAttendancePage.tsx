import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeviceStorage } from '@/services/storage/device-storage';

// Util para mascarar CPF
function maskCpf(value: string) {
  const numeric = value.replace(/\D/g, '').slice(0, 11);
  return numeric
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function ConfirmAttendancePage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [cpf, setCpf] = useState('');
  const [status, setStatus] = useState<string>('Informe seu CPF para confirmar presença.');
  const [submitting, setSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Util para armazenar tokens já enviados e evitar reenvio em loop
  function markTokenSubmitted(t: string) {
    if (!t) return;
    const raw = localStorage.getItem('aki_attendance_tokens');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(t)) {
      arr.push(t);
      localStorage.setItem('aki_attendance_tokens', JSON.stringify(arr));
    }
  }

  function isTokenSubmitted(t: string): boolean {
    const raw = localStorage.getItem('aki_attendance_tokens');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return arr.includes(t);
  }

  // Ao montar, se dispositivo já está registrado e temos CPF salvo, tentar registrar automaticamente.
  useEffect(() => {
    if (!token || autoSubmittedRef.current) return;
    const stored = DeviceStorage.get();
    const storedCpf = (stored as any)?.studentCpf || (stored as any)?.cpf;
    if (stored && storedCpf) {
      // Se já enviou este token anteriormente, mostrar mensagem e não reenviar.
      if (isTokenSubmitted(token)) {
        setStatus('✅ Presença já registrada para este evento.');
        setAlreadyRegistered(true);
        return;
      }
      autoSubmittedRef.current = true;
      setStatus('Registrando presença automaticamente...');
      submitWithCpf(storedCpf);
    }
  }, [token]);

  async function submitManual() {
    const unmasked = cpf.replace(/\D/g, '');
    if (unmasked.length !== 11) {
      setStatus('CPF inválido. Verifique e tente novamente.');
      return;
    }
    if (!token) {
      setStatus('Token ausente. Volte e escaneie novamente.');
      return;
    }
    submitWithCpf(unmasked);
  }

  async function submitWithCpf(unmaskedCpf: string) {
    setSubmitting(true);
    setStatus('Registrando presença...');
    try {
      let device = DeviceStorage.get();
      if (!device) {
        device = { id: crypto.randomUUID(), studentCpf: unmaskedCpf } as any;
      } else {
        // normaliza campo
        (device as any).studentCpf = unmaskedCpf;
      }
      DeviceStorage.save(device as any);

      const payload = {
        device_id: (device as any).id || (device as any).device_id || (device as any).deviceId || crypto.randomUUID(),
        qr_token: token,
        student_cpf: unmaskedCpf,
        location: { latitude: 0, longitude: 0 },
        device_time: new Date().toISOString(),
      };

      const rawBase: string | undefined = (window as any).__AKI_ENV__?.VITE_BFF_BASE_URL || (import.meta as any).env?.VITE_BFF_BASE_URL;
      // Detect placeholder pattern like ${VITE_BFF_BASE_URL} or empty string
      let base = rawBase && !/^\$\{.+\}$/.test(rawBase) ? rawBase.trim() : '';
      if (!base) {
        // hard fallback default (adjust if different env required)
        base = 'https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net';
      }
      if (!/^https?:\/\//i.test(base)) {
        setStatus('Configuração inválida de BFF_BASE_URL.');
        console.error('[Attendance] Invalid BFF base URL:', base);
        setSubmitting(false);
        return;
      }
      const response = await fetch(`${base.replace(/\/$/, '')}/events/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        // Se erro parecer duplicado
        if (response.status === 409 || /duplicado|já foi|already/i.test(err.message || '')) {
          setStatus('✅ Presença já registrada para este evento.');
          setAlreadyRegistered(true);
          markTokenSubmitted(token);
          return;
        }
        throw new Error(err.message || 'Falha ao registrar presença');
      }

      setStatus('✅ Presença registrada com sucesso!');
      markTokenSubmitted(token);
    } catch (e: any) {
      console.error(e);
      setStatus(e.message || 'Erro ao registrar presença');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--aki-light))] p-6">
      <Card className="shadow-xl w-full max-w-md border border-[hsl(var(--border))] bg-white/90 backdrop-blur">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-extrabold text-[hsl(var(--aki-gold))] tracking-tight">
            AKI<span className="text-[hsl(var(--aki-brown))]">!</span>
          </h1>
          <CardTitle className="mt-2 text-xl font-semibold text-[hsl(var(--aki-brown))]">
            Confirmar Presença
          </CardTitle>
          <CardDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            {token
              ? alreadyRegistered
                ? 'Este evento já foi registrado para este dispositivo.'
                : 'Digite o CPF vinculado ao seu dispositivo (primeira vez).'
              : 'Token não encontrado.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!alreadyRegistered && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[hsl(var(--aki-brown))]">CPF</label>
                <Input
                  value={cpf}
                  placeholder="000.000.000-00"
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  disabled={submitting}
                />
              </div>
              <Button
                onClick={submitManual}
                disabled={submitting || !token}
                className="bg-[hsl(var(--aki-gold))] hover:bg-[#fca311] text-white"
              >
                {submitting ? 'Enviando...' : 'Confirmar Presença'}
              </Button>
            </>
          )}
          <p className="text-xs text-center text-[hsl(var(--aki-brown))] mt-1">{status}</p>
        </CardContent>
      </Card>
      <footer className="mt-6 text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} <span className="font-semibold text-[hsl(var(--aki-brown))]">AKI!</span>
      </footer>
    </div>
  );
}
