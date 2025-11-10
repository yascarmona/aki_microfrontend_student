import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ScanPage() {
  const [status, setStatus] = useState("Carregando...");
  const [color, setColor] = useState("text-[hsl(var(--aki-brown))]");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpf, setCpf] = useState("");
  const [lastToken, setLastToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrToken =
      params.get("token") ||
      params.get("qrToken") ||
      window.location.pathname.split("/").pop();

    if (qrToken && qrToken.length > 30) {
      registerAttendance(qrToken);
    } else {
      fetchActiveEventQrCode();
    }
  }, []);

  async function registerAttendance(qrToken: string, cpfValue?: string) {
    try {
      setStatus("Registrando presença...");
      setColor("text-[hsl(var(--aki-brown))]");

      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("device_id", deviceId);
      }

      const payload = {
        device_id: deviceId,
        qr_token: qrToken,
        location: { latitude: 0, longitude: 0 },
        device_time: new Date().toISOString(),
        ...(cpfValue ? { student_cpf: cpfValue } : {}),
      };

      const response = await fetch(
        "https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net/events/attendance",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 404) {
        // 🔸 CPF não encontrado → abre modal
        setLastToken(qrToken);
        setShowCpfModal(true);
        setStatus("CPF não encontrado. Informe seu CPF para registrar presença.");
        setColor("text-[hsl(var(--aki-brown))]");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao registrar presença");
      }

      setStatus("✅ Presença registrada com sucesso!");
      setColor("text-[hsl(var(--success))]");
    } catch (err) {
      console.error(err);
      setStatus("❌ Token inválido. Por favor, escaneie o QR Code novamente.");
      setColor("text-[hsl(var(--destructive))]");
    }
  }

  async function fetchActiveEventQrCode() {
    try {
      setStatus("Carregando QR Code...");
      setColor("text-[hsl(var(--aki-brown))]");

      const classId = 9; // ajustar conforme turma
      const response = await fetch(
        `https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net/classes/${classId}/events`,
        { headers: { accept: "application/json" } }
      );

      if (!response.ok) throw new Error("Erro ao buscar evento ativo.");

      const events = await response.json();
      if (!events || events.length === 0) {
        setStatus("Nenhum evento ativo encontrado.");
        setColor("text-[hsl(var(--destructive))]");
        return;
      }

      const activeEvent = events[0];
      const token = activeEvent.qrToken || activeEvent.qr_token;

      if (!token) {
        setStatus("Evento ativo encontrado, mas sem token QR.");
        setColor("text-[hsl(var(--destructive))]");
        return;
      }

      const qrUrl = `https://aki-frontend-aluno.vercel.app/scan?token=${token}`;
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        qrUrl
      )}`;

      setQrCodeUrl(qrImage);
      setStatus("Aponte a câmera do celular para registrar sua presença no AKI!");
      setColor("text-[hsl(var(--aki-brown))]");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao carregar QR Code.");
      setColor("text-[hsl(var(--destructive))]");
    }
  }

  function handleSubmitCpf() {
    if (!cpf || !lastToken) return;
    setShowCpfModal(false);
    registerAttendance(lastToken, cpf);
  }

  // 🔸 Máscara simples de CPF
  function handleCpfChange(value: string) {
    const numeric = value.replace(/\D/g, "").slice(0, 11);
    const masked = numeric
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(masked);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--aki-light))] p-6">
      <Card className="shadow-xl w-full max-w-md border border-[hsl(var(--border))] bg-white/90 backdrop-blur">
        <CardHeader className="text-center">
          <h1 className="text-3xl font-extrabold text-[hsl(var(--aki-gold))] tracking-tight">
            AKI<span className="text-[hsl(var(--aki-brown))]">!</span>
          </h1>
          <CardTitle className="mt-2 text-xl font-semibold text-[hsl(var(--aki-brown))]">
            Registro de Presença
          </CardTitle>
          <CardDescription className="text-sm text-[hsl(var(--muted-foreground))]">
            {qrCodeUrl
              ? "Aponte a câmera do seu celular para o QR Code abaixo"
              : "Aguarde enquanto verificamos o evento ativo..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {qrCodeUrl ? (
            <>
              <img
                src={qrCodeUrl}
                alt="QR Code do evento AKI"
                className="border border-[hsl(var(--border))] rounded-2xl shadow-lg p-3 bg-white"
              />
              <p className={`text-base font-medium text-center ${color}`}>{status}</p>
            </>
          ) : (
            <p className={`text-base font-medium text-center ${color}`}>{status}</p>
          )}

          {/* 🔸 Modal CPF */}
          {showCpfModal && (
            <div className="mt-4 w-full text-center">
              <p className="text-sm text-[hsl(var(--aki-brown))] mb-2">
                Digite seu CPF para confirmar a presença:
              </p>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                className="mb-3"
              />
              <Button
                onClick={handleSubmitCpf}
                className="bg-[hsl(var(--aki-gold))] hover:bg-[#fca311] text-white w-full"
              >
                Confirmar Presença
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="mt-6 text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-[hsl(var(--aki-brown))]">AKI!</span> – Sistema de Presença Inteligente
      </footer>
    </div>
  );
}
