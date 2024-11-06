// src/types/api.ts

export interface User {
    id: number;
    username: string;
    role?: string;
  }
  
  export interface Video {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    createdAt: string;
    modificationDate: string;
  }
  
  export interface ActivityLogEntry {
    id: string;
    userId: string;
    username: string;
    videoId: string;
    videoTitle: string;
    action: 'viewed' | 'updated' | 'deleted' | 'assigned';
    timestamp: string;
  }
  
  export interface ApiResponse<T> {
    data: T;
    pageInfo?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
    success: boolean;
    message: string;
    code: number;
    status: string;
  }
  
  export interface AuthenticationResponse {
    userId: number;
    username: string;
    accessToken: string;
    refreshToken: string;
    roles: string[];
  }

  export type LoginResponse = AuthenticationResponse;
  
  export interface VideoAssignment {
    id: string;
    videoId: string;
    userId: number;
    assignedAt: string;
  }