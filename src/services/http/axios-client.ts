import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/shared/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: 'An unexpected error occurred',
          status: error.response?.status,
        };

        if (error.response?.data) {
          const data = error.response.data as any;
          apiError.message = data.message || data.error || apiError.message;
          apiError.code = data.code;
        } else if (error.request) {
          apiError.message = 'Network error - please check your connection';
        }

        return Promise.reject(apiError);
      }
    );
  }

  public getClient(): AxiosInstance {
    return this.client;
  }
}

export const httpClient = new HttpClient().getClient();
