import { httpClient } from '@/services/http/axios-client';
import { ScanRequest, ScanResponse } from '@/shared/types';

export async function submitScan(data: ScanRequest): Promise<ScanResponse> {
  const response = await httpClient.post<ScanResponse>('/scan', data);
  return response.data;
}
