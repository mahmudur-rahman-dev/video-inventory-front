import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [assignedVideos, setAssignedVideos] = useState<Video[]>([])
  const router = useRouter()

  useEffect(() => {
    const storedRole = Cookies.get('userRole')
    if (storedRole) {
      setIsAuthenticated(true)
      setUserRole(storedRole)
      if (storedRole === 'user') {
        // In a real app, you would fetch this from an API
        setAssignedVideos([
          { id: '1', title: 'Introduction to React', description: 'Learn the basics of React', videoUrl: 'https://example.com/video1.mp4' },
          { id: '2', title: 'Advanced TypeScript', description: 'Deep dive into TypeScript', videoUrl: 'https://example.com/video2.mp4' },
        ])
      }
    }
  }, [])

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      Cookies.set('userRole', 'admin', { expires: 1 }) // Expires in 1 day
      setIsAuthenticated(true)
      setUserRole('admin')
      router.push('/admin')
    } else if (username === 'user' && password === 'user') {
      Cookies.set('userRole', 'user', { expires: 1 }) // Expires in 1 day
      setIsAuthenticated(true)
      setUserRole('user')
      // In a real app, you would fetch assigned videos from an API here
      setAssignedVideos([
        { id: '1', title: 'Introduction to React', description: 'Learn the basics of React', videoUrl: 'https://example.com/video1.mp4' },
        { id: '2', title: 'Advanced TypeScript', description: 'Deep dive into TypeScript', videoUrl: 'https://example.com/video2.mp4' },
      ])
      router.push('/user')
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    Cookies.remove('userRole')
    setIsAuthenticated(false)
    setUserRole(null)
    setAssignedVideos([])
    router.push('/login')
  }

  return { isAuthenticated, userRole, assignedVideos, login, logout }
}