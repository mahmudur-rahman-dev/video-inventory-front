const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const api = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  getVideos: () => fetchWithAuth('/videos'),
  getVideo: (id: string) => fetchWithAuth(`/videos/${id}`),
  createVideo: (data: any) => fetchWithAuth('/videos', { method: 'POST', body: JSON.stringify(data) }),
  updateVideo: (id: string, data: any) => fetchWithAuth(`/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVideo: (id: string) => fetchWithAuth(`/videos/${id}`, { method: 'DELETE' }),

  getUsers: () => fetchWithAuth('/users'),
  getUser: (id: string) => fetchWithAuth(`/users/${id}`),
  createUser: (data: any) => fetchWithAuth('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => fetchWithAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => fetchWithAuth(`/users/${id}`, { method: 'DELETE' }),

  getActivityLogs: () => fetchWithAuth('/activity-logs'),
}