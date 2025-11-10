import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";

const API_BASE = "https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net";

export default function ScanPage() {
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>(""); // para exibir QR (professor)
  const [registering, setRegistering] = useState<boolean>(false);
  const [registerResult, setRegisterResult] = useState<{ status: "success" | "error"; text: string } | null>(null);

  const CLASS_ID = 9; // ajuste se necessário
  const TEACHER_EMAIL = "dimitrisonet@gmail.com"; // ajuste se necessário

  // --- Helper: extrai token de vários lugares (query param ou último segmento de path)
  function extractTokenFromLocation(): string | null {
    const search = new URLSearchParams(location.search);
    const candidates = ["token", "qrToken", "qr_token", "t"];
    for (const k of candidates) {
      const v = search.get(k);
      if (v) return v;
    }

    // se não encontrou em query, tenta pegar do path (último segmento)
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const last = pathParts[pathParts.length - 1];
      // heurística: tokens JWT costumam ter 3 partes separadas por ponto, ou ter comprimento > 20
      if (last.includes(".") || last.length > 20) return last;
    }

    return null;
  }

  // --- Se houver token na URL, registra presença automaticamente
  useEffect(() => {
    const token = extractTokenFromLocation();
    if (token) {
      // modo aluno: registra presença
      (async () => {
        setLoading(false);
        setRegistering(true);
        setMessage("Registrando sua presença...");

        try {
          // pega dados do dispositivo / aluno do localStorage (DeviceStorage)
          const deviceRaw = localStorage.getItem("aki_device");
          const device = deviceRaw ? JSON.parse(deviceRaw) : null;

          const payload = {
            device_id: device?.id || "unknown_device",
            qr_token: token,
            location: {
              latitude: device?.latitude ?? 0,
              longitude: device?.longitude ?? 0,
            },
            device_time: new Date().toISOString(),
            student_cpf: device?.studentCpf || "",
          };

          const res = await fetch(`${API_BASE}/events/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Erro ${res.status}: ${text}`);
          }

          const data = await res.json();
          console.log("attendance response:", data);

          setRegisterResult({ status: "success", text: "✅ Presença registrada com sucesso!" });
          setMessage("Presença registrada com sucesso.");
        } catch (err: any) {
          console.error("Erro ao registrar presença:", err);
          setRegisterResult({ status: "error", text: "❌ Não foi possível registrar a presença." });
          setMessage("Erro ao registrar presença. Veja o console para detalhes.");
        } finally {
          setRegistering(false);
        }
      })();
    } else {
      // modo professor / mostrar QR: busca qrToken do evento ativo
      (async () => {
        setLoading(true);
        setMessage("Carregando QR Code...");
        try {
          const url = `${API_BASE}/classes/${CLASS_ID}/events`;
          const res = await fetch(url, {
            method: "GET",
            headers: {
              accept: "application/json",
              "X-Teacher-Email": TEACHER_EMAIL,
            },
          });
          if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`Erro ${res.status}: ${text}`);
          }
          const events = await res.json();
          if (!Array.isArray(events) || events.length === 0) {
            setMessage("Nenhum evento encontrado para esta turma.");
            setQrValue("");
            return;
          }
          const activeEvent = events.find((e: any) => e.status === "active") || events[0];
          if (!activeEvent?.qrToken) {
            setMessage("Nenhum evento ativo com QR token encontrado.");
            setQrValue("");
            return;
          }
          setQrValue(activeEvent.qrToken);
          setMessage("");
        } catch (err) {
          console.error("Erro ao buscar eventos:", err);
          setMessage("Erro ao carregar QR Code. Veja o console para detalhes.");
          setQrValue("");
        } finally {
          setLoading(false);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 pb-8 flex flex-col justify-center items-center">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-primary text-3xl font-bold">AKI!</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">Sistema de Presença</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          {/* Loading while fetching QR (professor) */}
          {loading && !registering && (
            <p className="text-sm text-muted-foreground animate-pulse">{message || "Carregando..."}</p>
          )}

          {/* Se estiver registrando (aluno) */}
          {!loading && registering && (
            <p className="text-sm text-muted-foreground animate-pulse">{message || "Registrando..."}</p>
          )}

          {/* Se registro já ocorreu (aluno) */}
          {!loading && !registering && registerResult && (
            <div className="text-center">
              <p className={registerResult.status === "success" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                {registerResult.text}
              </p>
            </div>
          )}

          {/* Mostrar QR (professor) */}
          {!loading && !qrValue && !registerResult && message && (
            <p className="text-center text-muted-foreground">{message}</p>
          )}

          {!loading && qrValue && !registerResult && (
            <div className="flex flex-col items-center gap-3">
              <QRCode value={qrValue} size={220} />
              <p className="text-sm text-muted-foreground text-center">
                Mostre este QR Code para que os alunos escaneiem com a câmera do celular.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


//Se encontrar um token na URL (?token=... ou ?qrToken=... ou como último segmento do caminho), 
// faz o POST /events/attendance e mostra o resultado ao aluno (success / error).

// Se não houver token na URL, então carrega e exibe o QR code do evento ativo (GET /classes/{classId}/events) — 
// fluxo do professor (ou para mostrar o QR localmente)