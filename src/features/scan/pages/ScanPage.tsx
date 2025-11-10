import { useEffect, useState } from "react";

export default function ScanPage() {
  const [status, setStatus] = useState("Carregando...");
  const [color, setColor] = useState("text-gray-700");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qrToken = params.get("token");

    if (!qrToken) {
      setStatus("QR Code inválido.");
      setColor("text-red-600");
      return;
    }

    const registerAttendance = async () => {
      try {
        // Gera um device_id simples e persistente no localStorage
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem("device_id", deviceId);
        }

        // Simula o CPF do aluno logado
        const studentCpf = "12345678900"; // substitua pelo CPF real (ex: vindo do login)

        const payload = {
          device_id: deviceId,
          qr_token: qrToken,
          location: {
            latitude: 0,
            longitude: 0
          },
          device_time: new Date().toISOString(),
          student_cpf: studentCpf
        };

        const response = await fetch(
          "https://aki-bff-h9cjg7hpfzc9fggh.eastus2-01.azurewebsites.net/events/attendance",
          {
            method: "POST",
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Erro:", error);
          throw new Error(error.message || "Erro ao registrar presença");
        }

        setStatus("Presença registrada com sucesso! ✅");
        setColor("text-green-600");
      } catch (err: any) {
        console.error(err);
        setStatus("Erro ao registrar presença. Tente novamente.");
        setColor("text-red-600");
      }
    };

    registerAttendance();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Registro de Presença
      </h1>
      <p className={`text-xl font-medium ${color}`}>{status}</p>
    </div>
  );
}