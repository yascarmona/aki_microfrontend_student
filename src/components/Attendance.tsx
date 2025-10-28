import React, { useEffect, useState, useRef } from 'react';
import QRCodeRaw from 'react-qr-code';
const QRCode = QRCodeRaw as unknown as React.FC<{ value: string; size?: number }>;
import { submitAttendance, AttendancePayload, AttendanceResult } from '../services/attendanceService';

type Props = {
	// O microfrontend do Professor pode passar o token como prop
	initialQrToken?: string;
	// opcional: id do dispositivo (se não, o componente gera e guarda em localStorage)
	deviceStorageKey?: string;
	// opcional: função callback para log/analytics ao final
	onResult?: (r: AttendanceResult) => void;
};

export const Attendance: React.FC<Props> = ({ initialQrToken, deviceStorageKey = 'aki_device_id', onResult }) => {
	const [qrToken, setQrToken] = useState<string | null>(initialQrToken ?? null);
	const [loading, setLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [showCpf, setShowCpf] = useState(false);
	const [cpf, setCpf] = useState('');
	const submittingRef = useRef(false);
	const [deviceId, setDeviceId] = useState<string>(() => {
		try {
			const stored = localStorage.getItem(deviceStorageKey);
			if (stored) return stored;
			const id = (crypto && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `dev_${Date.now()}`;
			localStorage.setItem(deviceStorageKey, id);
			return id;
		} catch {
			const id = `dev_${Date.now()}`;
			localStorage.setItem(deviceStorageKey, id);
			return id;
		}
	});

	// escuta de evento global (Professor microfrontend pode disparar):
	useEffect(() => {
		function handler(e: Event) {
			// espera CustomEvent com detail: { qrToken: 'AKI_...' }
			const ce = e as CustomEvent;
			if (ce?.detail?.qrToken && typeof ce.detail.qrToken === 'string') {
				setQrToken(ce.detail.qrToken);
			}
		}
		window.addEventListener('professor-qr', handler as EventListener);
		return () => window.removeEventListener('professor-qr', handler as EventListener);
	}, []);

	// Reage quando chega token: renderiza QR e dispara validação automaticamente
	useEffect(() => {
		if (!qrToken) return;
		// start after small delay to let QR render
		const t = setTimeout(() => {
			void validateAndSendAttendance();
		}, 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [qrToken]);

	async function getPosition(): Promise<{ latitude: number; longitude: number } | null> {
		if (!navigator.geolocation) return null;
		return new Promise((resolve) => {
			const timeoutId = setTimeout(() => resolve(null), 10000);
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					clearTimeout(timeoutId);
					resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
				},
				() => {
					clearTimeout(timeoutId);
					resolve(null);
				},
				{ enableHighAccuracy: false, maximumAge: 10000, timeout: 10000 }
			);
		});
	}

	async function validateAndSendAttendance(extraCpf?: string) {
		if (!qrToken) {
			setStatusMessage('Aguardando QR token do professor.');
			return;
		}
		if (submittingRef.current) return; // bloqueio de reenvios
		submittingRef.current = true;
		setLoading(true);
		setStatusMessage(null);

		const loc = await getPosition();
		const payload: AttendancePayload = {
			device_id: deviceId,
			qr_token: qrToken,
			location: loc ?? undefined,
			device_time: new Date().toISOString(),
		};
		if (extraCpf) payload.cpf = extraCpf;

		const res = await submitAttendance(payload);
		setLoading(false);
		submittingRef.current = false;
		if (onResult) onResult(res);

		switch (res.type) {
			case 'success':
				setStatusMessage(res.message ?? 'Presença confirmada!');
				// bloquear novos envios por alguns segundos
				submittingRef.current = true;
				setTimeout(() => (submittingRef.current = false), 5000);
				break;
			case 'device_not_linked':
				// pedir CPF e permitir reenvio
				setShowCpf(true);
				setStatusMessage(res.message ?? 'Dispositivo não vinculado. Informe seu CPF.');
				break;
			case 'invalid_geolocation':
				setStatusMessage(res.message ?? 'Você não está no local da aula. Fale com seu professor.');
				break;
			case 'error':
			default:
				setStatusMessage(res.message ?? 'Erro ao registrar presença. Tente novamente.');
				break;
		}
	}

	async function handleSubmitCpf() {
		if (!cpf || cpf.trim().length < 8) {
			setStatusMessage('Informe um CPF válido.');
			return;
		}
		setShowCpf(false);
		setLoading(true);
		// reutiliza validateAndSendAttendance com cpf
		await validateAndSendAttendance(cpf.trim());
		setLoading(false);
	}

	// helper para professor enviar token via JS: window.dispatchEvent(new CustomEvent('professor-qr', { detail: { qrToken: 'AKI_...' } }))
	return (
		<div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', padding: 12 }}>
			<h3>Presença</h3>
			{qrToken ? (
				<div style={{ background: 'white', display: 'inline-block', padding: 8 }}>
					<QRCode value={qrToken} size={256} />
				</div>
			) : (
				<div style={{ padding: 16, border: '1px dashed #ccc' }}>Aguardando QR do professor...</div>
			)}

			<div style={{ marginTop: 12 }}>
				{loading ? <div>Enviando presença...</div> : statusMessage && <div>{statusMessage}</div>}
			</div>

			{showCpf && (
				<div role="dialog" aria-modal style={{ marginTop: 12, border: '1px solid #ddd', padding: 12 }}>
					<p>Dispositivo não vinculado. Informe seu CPF para tentar vincular:</p>
					<input
						value={cpf}
						onChange={(e) => setCpf(e.target.value)}
						placeholder="CPF (apenas números)"
						inputMode="numeric"
						style={{ padding: 8, width: '100%', boxSizing: 'border-box' }}
					/>
					<div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
						<button onClick={() => setShowCpf(false)} disabled={loading}>
							Cancelar
						</button>
						<button onClick={handleSubmitCpf} disabled={loading}>
							Enviar CPF
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Attendance;
