import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { submitAttendance, AttendancePayload, AttendanceResult } from '../services/attendanceService';
import { useDeviceId } from '../hooks/useDeviceId';

type Props = {
	initialQrToken?: string | null;
	deviceStorageKey?: string;
	onResult?: (r: AttendanceResult) => void;
};

const MOCK_QR = 'MOCK_AKI_2025_MOCKTOKEN'; // usado apenas para visualização enquanto não chega token do professor

export const Attendance: React.FC<Props> = ({ initialQrToken = null, deviceStorageKey, onResult }) => {
	const { deviceId } = useDeviceId(deviceStorageKey);
	const [qrToken, setQrToken] = useState<string | null>(initialQrToken ?? null);
	const [loading, setLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [showCpf, setShowCpf] = useState(false);
	const [cpf, setCpf] = useState('');
	const submittingRef = useRef(false);

	// Não há nenhum scanner/câmera criado aqui.
	// Sempre renderizamos um QR visual: se não houver token real, usamos o mock para mostrar.
	const qrToDisplay = qrToken ?? MOCK_QR;

	useEffect(() => {
		// Listener para receber token do microfrontend do professor:
		function handler(e: Event) {
			const ce = e as CustomEvent;
			if (ce?.detail?.qrToken && typeof ce.detail.qrToken === 'string') {
				setQrToken(ce.detail.qrToken);
			}
		}
		window.addEventListener('professor-qr', handler as EventListener);
		return () => window.removeEventListener('professor-qr', handler as EventListener);
	}, []);

	// Quando um token REAL chega (qrToken != null), disparar validação automaticamente.
	useEffect(() => {
		if (!qrToken) return;
		// pequena espera para render do QR antes de enviar
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
		// Só envia se houver token (token mock NÃO dispara envio)
		if (!qrToken) {
			setStatusMessage('Aguardando QR token do professor.');
			return;
		}
		if (submittingRef.current) return;
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
				// prevenir reenvios por um curto período
				submittingRef.current = true;
				setTimeout(() => (submittingRef.current = false), 5000);
				break;
			case 'device_not_linked':
				setShowCpf(true);
				setStatusMessage(res.message ?? 'Dispositivo não vinculado. Informe seu CPF.');
				break;
			case 'invalid_geolocation':
				setStatusMessage(res.message ?? 'Você não está no local da aula. Fale com seu professor.');
				break;
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
		await validateAndSendAttendance(cpf.trim());
	}

	return (
		<div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', padding: 12 }}>
			<h3>Presença</h3>

			{/* QR visual — sempre mostra algo. Enquanto não houver token real, mostramos mock. */}
			<div style={{ background: 'white', display: 'inline-block', padding: 8 }}>
				{React.createElement(QRCode as any, { value: qrToDisplay, size: 256 })}
			</div>

			<div style={{ marginTop: 8, color: '#666' }}>
				{qrToken ? (
					<span>Token recebido — registrando presença automaticamente.</span>
				) : (
					<span>QR mock (aguardando token do professor). O professor pode enviar via evento.</span>
				)}
			</div>

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

			{/* Hint para integração do professor microfrontend */}
			<div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
				<p>
					Para testes: o microfrontend do professor pode enviar o token chamando:
					<br />
					<code>window.dispatchEvent(new CustomEvent('professor-qr', {`{`} detail: {`{`} qrToken: 'AKI_2025_ABC123...' {`}`} {`}`}))</code>
				</p>
			</div>
		</div>
	);
};

export default Attendance;
