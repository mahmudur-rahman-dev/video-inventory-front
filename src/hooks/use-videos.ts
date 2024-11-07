import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Video, ApiResponse } from '@/types/api'
import { useToast } from '@/components/ui/use-toast'

export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: () => apiClient.get<Video[]>('/videos')
  })
}

export function useVideo(id: string) {
  return useQuery({
    queryKey: ['videos', id],
    queryFn: () => apiClient.get<Video>(`/videos/${id}`),
    enabled: !!id
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (video: Video) => 
      apiClient.put<Video>(`/videos/${video.id}`, video),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({
        title: "Success",
        description: "Video updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update video",
        variant: "destructive",
      })
    }
  })
}

export function useDeleteVideo() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => 
      apiClient.delete<void>(`/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({
        title: "Success",
        description: "Video deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete video",
        variant: "destructive",
      })
    }
  })
}