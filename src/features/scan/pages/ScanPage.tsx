import { useEffect, useState } from "react";

export default function ScanPage() {
  const [status, setStatus] = useState("Carregando...");
  const [color, setColor] = useState("text-gray-700");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrToken =
      params.get("token") ||
      params.get("qrToken") ||
      window.location.pathname.split("/").pop();

    // Se tiver token → fluxo do aluno (registrar presença)
    if (qrToken && qrToken.length > 30) {
      registerAttendance(qrToken);
    } else {
      // Se não tiver token → fluxo do professor (mostrar QR Code do evento ativo)
      fetchActiveEventQrCode();
    }
  }, []);

  async function registerAttendance(qrToken: string) {
    try {
      setStatus("Registrando presença...");
      setColor("text-blue-600");

      let deviceId = localStorage.getItem("device_id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("device_id", deviceId);
      }

      const studentCpf = "12345678900"; // ← mock ou do login
      const payload = {
        device_id: deviceId,
        qr_token: qrToken,
        location: { latitude: 0, longitude: 0 },
        device_time: new Date().toISOString(),
        student_cpf: studentCpf,
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

      if (!response.ok) {
        const error = await response.json();
        console.error("Erro:", error);
        throw new Error(error.message || "Erro ao registrar presença");
      }

      setStatus("Presença registrada com sucesso! ✅");
      setColor("text-green-600");
    } catch (err) {
      console.error(err);
      setStatus("Token inválido. Por favor, escaneie o QR Code novamente.");
      setColor("text-red-600");
    }
  }

  async function fetchActiveEventQrCode() {
    try {
      setStatus("Carregando QR Code...");
      setColor("text-gray-700");

      const classId = 9; // ← trocar conforme sua turma
      const response = await fetch(
        `https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net/classes/${classId}/events`,
        { headers: { accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar evento ativo.");
      }

      const events = await response.json();
      if (!events || events.length === 0) {
        setStatus("Nenhum evento ativo encontrado.");
        setColor("text-red-600");
        return;
      }

      const activeEvent = events[0];
      const token = activeEvent.qrToken || activeEvent.qr_token;

      if (!token) {
        setStatus("Evento ativo encontrado, mas sem token QR.");
        setColor("text-red-600");
        return;
      }

      // Monta URL completa com token — fluxo do aluno
      const qrUrl = `https://aki-frontend-aluno.vercel.app/scan?token=${token}`;
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        qrUrl
      )}`;

      setQrCodeUrl(qrImage);
      setStatus("Escaneie o QR Code para registrar sua presença!");
      setColor("text-gray-800");
    } catch (err) {
      console.error(err);
      setStatus("Erro ao carregar QR Code.");
      setColor("text-red-600");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Registro de Presença
      </h1>

      {qrCodeUrl ? (
        <>
          <img
            src={qrCodeUrl}
            alt="QR Code do evento"
            className="border border-gray-300 rounded-xl shadow-lg p-2 bg-white"
          />
          <p className="mt-4 text-lg text-gray-700 text-center">
            Aponte a câmera do celular para registrar presença.
          </p>
        </>
      ) : (
        <p className={`text-xl font-medium ${color}`}>{status}</p>
      )}
    </div>
  );
}


//Se encontrar um token na URL (?token=... ou ?qrToken=... ou como último segmento do caminho), 
// faz o POST /events/attendance e mostra o resultado ao aluno (success / error).
// Se não houver token na URL, então carrega e exibe o QR code do evento ativo (GET /classes/{classId}/events) — 
// fluxo do professor (ou para mostrar o QR localmente)