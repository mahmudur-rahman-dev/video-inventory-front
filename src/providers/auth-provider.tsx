// eslint-disable-next-line @typescript-eslint/no-empty-interface

"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api-auth'
import { clearAuthCookies, getUserData, getAccessToken } from '@/lib/auth-utils'

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: number;
    username: string;
    roles: string[];
  } | null;
  userRole: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    userRole: null,
    isLoading: true,
  })
  
  const router = useRouter()

  const getPrimaryRole = (roles: string[]): string | null => {
    if (roles.includes('ROLE_ADMIN')) return 'admin'
    if (roles.includes('ROLE_USER')) return 'user'
    return null
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = getUserData()
        const accessToken = getAccessToken()

        if (userData && accessToken) {
          setAuthState({
            isAuthenticated: true,
            user: userData,
            userRole: getPrimaryRole(userData.roles),
            isLoading: false,
          })
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        handleLogout()
      }
    }

    initializeAuth()
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password)
      
      if (!response.success) {
        throw new Error(response.message)
      }

      const { userId, username: userName, roles } = response.data

      const userData = {
        id: userId,
        username: userName,
        roles,
      }

      const primaryRole = getPrimaryRole(roles)

      setAuthState({
        isAuthenticated: true,
        user: userData,
        userRole: primaryRole,
        isLoading: false,
      })

      router.push(primaryRole === 'admin' ? '/admin' : '/user')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      console.log("Attempt server-side logout")
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthCookies()
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        userRole: null,
        isLoading: false,
      })
      
      router.push('/login')
    }
  }

  if (authState.isLoading) {
    return <div>Loading...</div> 
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}