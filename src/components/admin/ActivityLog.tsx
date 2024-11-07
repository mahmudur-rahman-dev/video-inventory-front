"use client"

import React, { useMemo, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityLogEntry } from "@/types/api"

interface PaginationState {
  page: number;
  pageSize: number;
}

export function ActivityLog() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    page: 0,
    pageSize: 10,
  })

  const { data: response, isLoading } = useQuery({
    queryKey: ['activity-logs', pagination],
    queryFn: async () => {
      return apiClient.get<ActivityLogEntry[]>('/activity-logs', {
        page: pagination.page.toString(),
        size: pagination.pageSize.toString(),
      })
    },
  })

  const columns = useMemo<ColumnDef<ActivityLogEntry>[]>(() => [
    {
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.user.username}</div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const actionColors = {
          viewed: "text-blue-600",
          updated: "text-amber-600",
          deleted: "text-red-600",
          assigned: "text-green-600",
        }
        const action = row.original.action
        return (
          <div className={actionColors[action]}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </div>
        )
      },
    },
    {
      accessorKey: "videoTitle",
      header: "Video",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.original.video.title}
        </div>
      ),
    },
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.timestamp).toLocaleString()}
        </div>
      ),
    },
  ], [])

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }, [])

  const handlePageSizeChange = useCallback((newSize: string) => {
    setPagination(prev => ({
      ...prev,
      pageSize: parseInt(newSize, 10),
      page: 0,
    }))
  }, [])

  const logs = response?.data ?? []
  const pageInfo = response?.pageInfo

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pageInfo?.totalPages ?? -1,
  })

  if (isLoading && !logs.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
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
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length} 
                    className="h-24 text-center"
                  >
                    No activity logs found
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
                value={pagination.pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={pagination.pageSize} />
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
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={pagination.page === i ? "default" : "outline"}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pageInfo.totalPages - 1 || isLoading}
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