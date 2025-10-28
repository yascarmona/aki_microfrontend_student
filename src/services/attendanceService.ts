import axios from 'axios';

export type AttendanceResult =
	| { type: 'success'; message?: string }
	| { type: 'device_not_linked'; message?: string }
	| { type: 'invalid_geolocation'; message?: string }
	| { type: 'error'; message?: string };

const BFF_BASE = process.env.REACT_APP_BFF_URL || ''; // configure in env

export interface AttendancePayload {
	device_id: string;
	qr_token: string;
	location?: { latitude: number; longitude: number } | null;
	device_time: string; // ISO
	cpf?: string;
}

/**
 * Envia o evento de presença para o BFF.
 * Retorna um objeto com tipo padronizado para o componente consumir.
 */
export async function submitAttendance(payload: AttendancePayload): Promise<AttendanceResult> {
	try {
		const url = `${BFF_BASE}/events/attendance`;
		const resp = await axios.post(url, payload, { timeout: 10000 });
		// backend contract: adaptar conforme API real.
		const data = resp.data ?? {};

		// Exemplos de formatos possíveis: ajustar se necessário
		if (data?.status === 'ok' || data?.result === 'success') {
			return { type: 'success', message: data?.message ?? 'Presença confirmada!' };
		}

		// Se backend usa error codes
		if (data?.error === 'device_not_linked' || data?.code === 'device_not_linked') {
			return { type: 'device_not_linked', message: data?.message ?? 'Dispositivo não vinculado' };
		}

		if (data?.error === 'invalid_geolocation' || data?.code === 'invalid_geolocation') {
			return { type: 'invalid_geolocation', message: data?.message ?? 'Localização inválida' };
		}

		// fallback: if HTTP 200 but business-level error
		if (data?.status === 'error' || data?.result === 'error') {
			return { type: 'error', message: data?.message ?? 'Erro ao registrar presença' };
		}

		// If backend returns plain boolean or other shape, interpret as success
		return { type: 'success', message: 'Presença confirmada!' };
	} catch (err: any) {
		// HTTP errors / network
		if (err?.response?.data) {
			const d = err.response.data;
			if (d?.error === 'device_not_linked') return { type: 'device_not_linked', message: d?.message };
			if (d?.error === 'invalid_geolocation') return { type: 'invalid_geolocation', message: d?.message };
			return { type: 'error', message: d?.message ?? 'Erro do servidor' };
		}
		return { type: 'error', message: err?.message ?? 'Erro de rede' };
	}
}

export default { submitAttendance };