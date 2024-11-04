import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedRole = Cookies.get('userRole')
    if (storedRole) {
      setIsAuthenticated(true)
      setUserRole(storedRole)
    }
  }, [])

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      Cookies.set('userRole', 'admin', { expires: 1 }) // Expires in 1 day
      setIsAuthenticated(true)
      setUserRole('admin')
      router.push('/admin')
    } else if (username === 'user' && password === 'user') {
      Cookies.set('userRole', 'user', { expires: 1 })
      setIsAuthenticated(true)
      setUserRole('user')
      router.push('/dashboard')
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    Cookies.remove('userRole')
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/login')
  }

  return { isAuthenticated, userRole, login, logout }
}