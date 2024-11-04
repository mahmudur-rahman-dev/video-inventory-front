import { Video, User, ActivityLogEntry } from './types'

const API_BASE_URL = '/api' // Adjust this based on your backend URL

export async function uploadVideo(videoData: { title: string; description: string; file: File; userId: number }) {
  const formData = new FormData()
  formData.append('title', videoData.title)
  formData.append('description', videoData.description)
  formData.append('file', videoData.file)
  formData.append('userId', videoData.userId.toString())

  const response = await fetch(`${API_BASE_URL}/videos`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Failed to upload video')
  }

  return await response.json()
}

export async function getVideos(): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/videos`)
  if (!response.ok) {
    throw new Error('Failed to fetch videos')
  }
  return await response.json()
}

export async function deleteVideo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete video')
  }
}

export async function updateVideo(id: number, videoData: Partial<Video>): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(videoData),
  })
  if (!response.ok) {
    throw new Error('Failed to update video')
  }
  return await response.json()
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return await response.json()
}

export async function assignVideoToUser(videoId: number, userId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/videos/${videoId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  })
  if (!response.ok) {
    throw new Error('Failed to assign video to user')
  }
}

export async function getActivityLogs(): Promise<ActivityLogEntry[]> {
  const response = await fetch(`${API_BASE_URL}/activity-log`)
  if (!response.ok) {
    throw new Error('Failed to fetch activity logs')
  }
  return await response.json()
}