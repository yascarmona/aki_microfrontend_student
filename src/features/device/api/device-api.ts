import { httpClient } from '@/services/http/axios-client';
import { DeviceRegistrationRequest, DeviceRegistrationResponse } from '@/shared/types';

export async function registerDevice(
  data: DeviceRegistrationRequest
): Promise<DeviceRegistrationResponse> {
  const response = await httpClient.post<DeviceRegistrationResponse>(
    '/students/device',
    data
  );
  return response.data;
}
