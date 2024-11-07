// api-auth.ts
import { setAuthCookies, clearAuthCookies, getRefreshToken } from './auth-utils'
import type { ApiResponse, LoginResponse } from '@/types/api'

const getAuthBaseUrl = () => {
  if (typeof window === 'undefined') {
    return `${process.env.NEXT_INTERNAL_API_BASE_URL}/auth` || 'http://backend:8080/api/v1/auth';
  }
  
  return `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth` || 'http://localhost:8080/api/v1/auth';
};

export const authService = {
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const baseUrl = getAuthBaseUrl();
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Authentication failed' }))
      throw new Error(error.message || 'Authentication failed')
    }

    const data = await response.json()
    setAuthCookies(data.data)
    return data
  },

  async logout(): Promise<void> {
    const baseUrl = getAuthBaseUrl();
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearAuthCookies()
      return
    }

    try {
      const response = await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Logout failed' }))
        throw new Error(error.message || 'Logout failed')
      }
    } finally {
      clearAuthCookies()
    }
  }
}