"use client"

import { useMemo, useCallback, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Video, ApiResponse } from "@/types/api"

export function VideoManagement() {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: response, isLoading } = useQuery({
    queryKey: ['videos', { page: currentPage, size: pageSize }],
    queryFn: async () => {
      const result = await apiClient.get<Video[]>(`/videos?page=${currentPage}&size=${pageSize}`)
      return result as ApiResponse<Video[]>
    },
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
    mutationFn: (id: number) => apiClient.delete<void>(`/videos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      toast({ 
        title: "Success", 
        description: "Video deleted successfully",
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
        await deleteMutation.mutateAsync(Number(selectedVideo.id))
      } catch (error) {
        console.error('Delete error:', error)
      }
    }
  }, [selectedVideo, deleteMutation])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: string) => {
    setPageSize(Number(newSize))
    setCurrentPage(0) 
  }, [])

  
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
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

  const videos = response?.data ?? []
  const pageInfo = response?.pageInfo

  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageInfo?.totalPages ?? -1,
  })

  if (isLoading && !videos.length) {
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
            {videos.length === 0 ? (
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pageInfo && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Rows per page
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {`${pageInfo.currentPage * pageInfo.pageSize + 1}-${Math.min(
                (pageInfo.currentPage + 1) * pageInfo.pageSize,
                pageInfo.totalElements
              )} of ${pageInfo.totalElements}`}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {pageInfo && Array.from({ length: pageInfo.totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i)}
                  disabled={isLoading}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pageInfo || currentPage >= pageInfo.totalPages - 1 || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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