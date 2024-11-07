import type { ApiResponse } from '@/types/api';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
console.log('API Base URL:', baseUrl);

interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

const createApiError = (status: number, message: string) => {
  const error = new Error(message);
  error.name = 'ApiError';
  (error as any).status = status;
  return error;
}

const buildUrl = (endpoint: string, params?: QueryParams): string => {
  if (!params) return `${baseUrl}${endpoint}`;
  
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
    
  return `${baseUrl}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
}

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Unauthorized access - redirecting to login')
      throw createApiError(response.status, 'Unauthorized')
    }
    
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw createApiError(response.status, error.message || 'An error occurred');
  }
  return response.json();
}

export const apiClient = {
  get: async <T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint, params), {
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data?: any, params?: QueryParams): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data: any, params?: QueryParams): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  upload: async <T>(endpoint: string, formData: FormData, params?: QueryParams): Promise<ApiResponse<T>> => {
    const response = await fetch(buildUrl(endpoint, params), {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse<T>(response);
  }
};