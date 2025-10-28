import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'aki_device_id';

/**
 * Gera um UUID seguro se disponível, fallback para timestamp+random.
 */
function generateId(): string {
	try {
		// use native crypto.randomUUID if available
		if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
			return (crypto as any).randomUUID();
		}
		// fallback
		return `dev_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
	} catch {
		return `dev_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
	}
}

/**
 * Recupera o deviceId do localStorage ou cria um novo.
 * Uso síncrono para permitir uso fora de React se necessário.
 */
export function getOrCreateDeviceId(storageKey = STORAGE_KEY): string {
	try {
		const stored = localStorage.getItem(storageKey);
		if (stored) return stored;
		const id = generateId();
		localStorage.setItem(storageKey, id);
		return id;
	} catch {
		// em ambientes sem localStorage (SSR), gerar ID não-persistente
		return generateId();
	}
}

/**
 * Hook React que fornece deviceId e utilitário para regenerar/resetar.
 * NÃO inicia câmera nem scanner.
 */
export function useDeviceId(storageKey = STORAGE_KEY) {
	const [deviceId, setDeviceId] = useState<string>(() => getOrCreateDeviceId(storageKey));
	const [loading, setLoading] = useState(false);

	const regenerate = useCallback(() => {
		setLoading(true);
		try {
			const id = generateId();
			try {
				localStorage.setItem(storageKey, id);
			} catch {
				// ignore storage errors
			}
			setDeviceId(id);
			return id;
		} finally {
			setLoading(false);
		}
	}, [storageKey]);

	// sincroniza caso outra aba mude o deviceId
	useEffect(() => {
		function onStorage(e: StorageEvent) {
			if (e.key === storageKey) {
				if (e.newValue) setDeviceId(e.newValue);
			}
		}
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, [storageKey]);

	return { deviceId, loading, regenerate };
}

export default useDeviceId;