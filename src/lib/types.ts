export interface Video {
    id: number
    title: string
    description: string
    videoUrl: string
    assignedToUserId?: number
  }
  
  export interface User {
    id: number
    username: string
    role: 'Admin' | 'User'
  }
  
  export interface ActivityLogEntry {
    id: number
    userId: number
    videoId: number
    action: 'viewed' | 'updated'
    timestamp: string
  }