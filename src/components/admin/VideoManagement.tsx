// src/components/admin/VideoManagement.tsx
"use client"

import { useMemo, useCallback, useState } from "react"
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
import { EditVideoModal, type VideoFormValues } from './modals/EditVideoModal'
import { ViewVideoModal } from './modals/ViewVideoModal'
import { DeleteVideoModal } from './modals/DeleteVideoModal'
import type { Video } from "@/types/api"

export function VideoManagement() {
  // State management
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query and Mutations
  const { data: videosResponse, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiClient.get<Video[]>('/videos'),
    staleTime: 1000 * 60, // Cache data for 1 minute
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

  // Memoized event handlers
  const handleEditClick = useCallback((video: Video) => {
    setSelectedVideo(video)
    setEditDialogOpen(true)
  }, [])

  const handleViewClick = useCallback((video: Video) => {
    setSelectedVideo(video)
    setViewDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((video: Video) => {
    setSelectedVideo(video)
    setDeleteDialogOpen(true)
  }, [])

  const handleUpdate = useCallback(async (data: VideoFormValues) => {
    try {
      await updateMutation.mutateAsync(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [updateMutation])

  const handleDelete = useCallback(async () => {
    if (selectedVideo) {
      try {
        await deleteMutation.mutateAsync(selectedVideo.id)
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }, [selectedVideo, deleteMutation])

  // Memoized columns definition
  const columns = useMemo<ColumnDef<Video>[]>(() => [
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
            onClick={() => handleViewClick(row.original)}
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
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [handleViewClick, handleEditClick, handleDeleteClick])

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

      {/* Modals */}
      <DeleteVideoModal
        video={selectedVideo}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <ViewVideoModal
        video={selectedVideo}
        isOpen={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditVideoModal
        video={selectedVideo}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleUpdate}
        isUpdating={updateMutation.isPending}
      />
    </div>
  )
}