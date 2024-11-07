import Cookies from 'js-cookie'
import { AUTH_CONSTANTS } from './auth-constants'
import type { AuthenticationResponse } from '@/types/api'

export const AUTH_COOKIE_EXPIRY = 7 // days

export const setAuthCookies = (response: AuthenticationResponse) => {
  const { accessToken, refreshToken, userId, username, roles } = response
  
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  const userData = { id: userId, username, roles }
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.USER_DATA, JSON.stringify(userData), {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })

  console.log('Setting refresh token:', refreshToken)
  Cookies.set(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    expires: AUTH_COOKIE_EXPIRY,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  })
}

export const clearAuthCookies = () => {
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
  const refreshToken = Cookies.get(AUTH_CONSTANTS.COOKIE_NAMES.REFRESH_TOKEN)
  console.log('Retrieved refresh token:', refreshToken)
  return refreshToken
}