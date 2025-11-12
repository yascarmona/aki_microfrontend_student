import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  // Removido fluxo de modal CPF; agora redireciona para rota dedicada.

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrToken =
      params.get("token") ||
      params.get("qrToken") ||
      window.location.pathname.split("/").pop();

    if (qrToken && qrToken.length > 30) {
      // Novo comportamento: SEMPRE redireciona para confirmação de CPF ao escanear um token de evento.
      navigate(`/attendance/confirm?token=${encodeURIComponent(qrToken)}`);
    } else {
      fetchActiveEventQrCode();
    }
  }, []);

  // Função de registro direto removida do fluxo de escaneio inicial; uso fica centralizado na página de confirmação.

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

  // Fluxo de CPF removido daqui.

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

          {/* Modal CPF removido: fluxo agora usa rota /attendance/confirm */}
        </CardContent>
      </Card>

      <footer className="mt-6 text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-[hsl(var(--aki-brown))]">AKI!</span> – Sistema de Presença Inteligente
      </footer>
    </div>
  );
}
