// auth-utils.ts
import Cookies from 'js-cookie'
import { AUTH_CONSTANTS } from './auth-constants'
import type { AuthenticationResponse } from '@/types/api'

export const AUTH_COOKIE_EXPIRY = 7 // days

export const setAuthCookies = (response: AuthenticationResponse) => {
  const { accessToken, refreshToken, userId, username, roles } = response
  
  // Set auth cookies with secure flags
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  // Store user data
  const userData = { id: userId, username, roles }
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.USER_DATA, JSON.stringify(userData), {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  // Store refresh token in cookie instead of localStorage
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
}

export const clearAuthCookies = () => {
  // Remove all cookies with proper path
  Cookies.remove(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN, { path: '/' })
  Cookies.remove(AUTH_CONSTANTS.COOKIE_NAMES.USER_DATA, { path: '/' })
  Cookies.remove(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, { path: '/' })
}

export const getUserData = () => {
  const userStr = Cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.USER_DATA)
  try {
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export const getAccessToken = () => {
  return Cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN)
}

export const getRefreshToken = () => {
  return Cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN)
}