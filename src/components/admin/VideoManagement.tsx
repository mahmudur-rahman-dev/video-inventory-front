// src/components/admin/VideoManagement.tsx
"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2, Eye, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import ReactPlayer from 'react-player'
import type { Video } from "@/types/api"

// Form validation schema
const videoFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
})

type VideoFormValues = z.infer<typeof videoFormSchema>

// Video Player Component
const VideoPlayer = ({ src, title }: { src: string; title: string }) => {
  const { toast } = useToast()
  
  return (
    <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
      <ReactPlayer
        url={src}
        width="100%"
        height="100%"
        controls
        playsinline
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              disablePictureInPicture: true,
              playsInline: true,
              crossOrigin: "anonymous",
            },
            forceVideo: true,
            forceHLS: false,
            forceDASH: false,
          }
        }}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onError={(e) => {
          console.error('Video playback error:', e);
          toast({
            title: "Playback Error",
            description: "Failed to load video. Please try again.",
            variant: "destructive",
          });
        }}
      />
    </div>
  )
}

export function VideoManagement() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Form setup
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  // Reset form and set video data when opening edit modal
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video)
    form.reset({
      title: video.title,
      description: video.description,
    })
    setEditDialogOpen(true)
  }

  // Function to get correct video URL
  const getVideoUrl = (videoUrl: string | undefined) => {
    if (!videoUrl) return '';
    
    const baseUrl = process.env.NEXT_VIDEO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/uploads/${videoUrl}`;
  };

  // Query and Mutations
  const { data: videosResponse, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiClient.get<Video[]>('/videos')
  })

  const updateMutation = useMutation({
    mutationFn: (data: VideoFormValues) => {
      if (!selectedVideo) throw new Error("No video selected")
      return apiClient.put<Video>(`/videos/${selectedVideo.id}`, {
        ...selectedVideo,
        ...data,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({ 
        title: "Success", 
        description: "Video updated successfully",
        variant: "default",
      })
      setEditDialogOpen(false)
      form.reset()
      setSelectedVideo(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update video",
        variant: "destructive",
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({ 
        title: "Success", 
        description: "Video deleted successfully",
        variant: "default",
      })
      setDeleteDialogOpen(false)
      setSelectedVideo(null)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete video",
        variant: "destructive",
      })
    }
  })

  // Handle form submission
  const onSubmit = async (data: VideoFormValues) => {
    try {
      await updateMutation.mutateAsync(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  // Table Columns Definition
  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedVideo(row.original)
              setViewDialogOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => handleEditClick(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedVideo(row.original)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const videos = videosResponse?.data ?? []
  
  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  // Video Player Dialog
  const ViewDialog = () => (
    <Dialog 
      open={viewDialogOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setSelectedVideo(null)
        }
        setViewDialogOpen(open)
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{selectedVideo?.title}</DialogTitle>
        </DialogHeader>
        {selectedVideo && (
          <div className="mt-4">
            <VideoPlayer
              src={getVideoUrl(selectedVideo.videoUrl)}
              title={selectedVideo.title}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedVideo.description}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  // Edit Dialog
  const EditDialog = () => (
    <Dialog 
      open={editDialogOpen} 
      onOpenChange={(open) => {
        if (!open) {
          form.reset()
          setSelectedVideo(null)
        }
        setEditDialogOpen(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter video title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter video description"
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={updateMutation.isPending || !form.formState.isDirty}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center"
                >
                  No videos found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={() => selectedVideo && deleteMutation.mutate(selectedVideo.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewDialog />
      <EditDialog />
    </div>
  )
}