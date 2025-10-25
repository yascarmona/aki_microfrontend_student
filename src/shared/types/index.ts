export interface ScanRequest {
  qr_token: string;
  device_id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  device_time: string;
}

export interface ScanResponse {
  success: boolean;
  message: string;
  presence_id?: string;
  timestamp?: string;
}

export interface DeviceRegistrationRequest {
  cpf: string;
  device_id: string;
}

export interface DeviceRegistrationResponse {
  success: boolean;
  message: string;
  device_id: string;
}

export interface QueuedScan {
  id: string;
  data: ScanRequest;
  timestamp: number;
  retries: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
