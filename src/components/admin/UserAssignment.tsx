"use client"

import { useMemo, useCallback, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, UserPlus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import type { Video, User, VideoAssignment } from "@/types/api"

interface Assignment extends VideoAssignment {
  video: Video;
  user: User;
}

export function UserAssignment() {
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  
  const [selectedVideo, setSelectedVideo] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: videosResponse } = useQuery({
    queryKey: ['videos'],
    queryFn: () => apiClient.get<Video[]>('/videos')
  })

  const { data: usersResponse } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/users')
  })

  const { data: assignmentsResponse, isLoading } = useQuery({
    queryKey: ['assignments', { page: currentPage, size: pageSize }],
    queryFn: () => apiClient.get<Assignment[]>(
      `/videos/assignments`,
      { page: currentPage, size: pageSize }
    )
  })

  const assignMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post<Assignment>(
        `/videos/${selectedVideo}/assign`,
        null,
        { userId: BigInt(selectedUser).toString() }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      toast({
        title: "Success",
        description: "Video assigned successfully",
      })
      setSelectedVideo("")
      setSelectedUser("")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign video",
        variant: "destructive",
      })
    }
  })

  const removeMutation = useMutation({
    mutationFn: (assignmentId: string) => 
      apiClient.delete<void>(`/videos/remove-assignment/${assignmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove assignment",
        variant: "destructive",
      })
    }
  })

  const handleAssign = useCallback(async () => {
    if (!selectedVideo || !selectedUser) {
      toast({
        title: "Error",
        description: "Please select both a video and a user",
        variant: "destructive",
      })
      return
    }

    try {
      await assignMutation.mutateAsync()
    } catch (error) {
      console.error('Assignment error:', error)
    }
  }, [selectedVideo, selectedUser, assignMutation, toast])

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newSize: string) => {
    setPageSize(Number(newSize))
    setCurrentPage(0)
  }, [])

  const columns = useMemo<ColumnDef<Assignment>[]>(() => [
    {
      accessorKey: "video.title",
      header: "Video",
      cell: ({ row }) => (
        <div className="font-medium max-w-[200px] truncate">
          {row.original.video.title}
        </div>
      ),
    },
    {
      accessorKey: "user.username",
      header: "Assigned To",
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate">
          {row.original.user.username}
        </div>
      ),
    },
    {
      accessorKey: "assignedAt",
      header: "Assigned At",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.assignedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeMutation.mutate(row.original.id)}
          disabled={removeMutation.isPending}
          className="text-slate-900 hover:text-slate-900"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ], [removeMutation])

  const videos = videosResponse?.data ?? []
  const users = usersResponse?.data ?? []
  const assignments = assignmentsResponse?.data ?? []
  const pageInfo = assignmentsResponse?.pageInfo

  const table = useReactTable({
    data: assignments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageInfo?.totalPages ?? -1,
  })

  if (isLoading && !assignments.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Videos to Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Video</label>
            <Select
              value={selectedVideo}
              onValueChange={setSelectedVideo}
              disabled={assignMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a video" />
              </SelectTrigger>
              <SelectContent>
                {videos
                  .filter(video => !assignments.some(a => a.videoId === video.id))
                  .map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select
              value={selectedUser}
              onValueChange={setSelectedUser}
              disabled={assignMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleAssign} 
          disabled={assignMutation.isPending || !selectedVideo || !selectedUser}
          className="w-full"
        >
          {assignMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Video to User
            </>
          )}
        </Button>

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
              {assignments.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="h-24 text-center"
                  >
                    No assignments found
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
                {Array.from({ length: pageInfo.totalPages }, (_, i) => (
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
                disabled={currentPage >= pageInfo.totalPages - 1 || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}