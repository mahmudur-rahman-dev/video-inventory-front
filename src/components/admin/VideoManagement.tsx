// src/components/admin/VideoManagement.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Video } from "@/types/api"

export function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const fetchVideos = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get<Video[]>('/videos')
      if (response.success) {
        setVideos(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch videos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await apiClient.delete<void>(`/videos/${id}`)
      if (response.success) {
        setVideos(prevVideos => prevVideos.filter(video => video.id !== id))
        toast({
          title: "Success",
          description: "Video deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handleUpdate = async (video: Video) => {
    try {
      setIsUpdating(true)
      const response = await apiClient.put<Video>(`/videos/${video.id}`, video)
      if (response.success) {
        setVideos(prevVideos =>
          prevVideos.map(v => v.id === video.id ? response.data : v)
        )
        toast({
          title: "Success",
          description: "Video updated successfully",
        })
        setEditDialogOpen(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const EditDialog = () => (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={selectedVideo?.title || ''}
              onChange={e => setSelectedVideo(prev => 
                prev ? { ...prev, title: e.target.value } : null
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={selectedVideo?.description || ''}
              onChange={e => setSelectedVideo(prev => 
                prev ? { ...prev, description: e.target.value } : null
              )}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => selectedVideo && handleUpdate(selectedVideo)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No videos found
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.description}</TableCell>
                    <TableCell>{video.assignedToUserId ? 'Assigned' : 'Unassigned'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{video.title}</DialogTitle>
                          </DialogHeader>
                          <video
                            src={video.videoUrl}
                            controls
                            className="w-full aspect-video rounded-lg"
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedVideo(video)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedVideo(video)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete
                              &quot;{selectedVideo?.title}&quot; and remove it from the servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => selectedVideo && handleDelete(selectedVideo.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <EditDialog />
    </div>
  )
}