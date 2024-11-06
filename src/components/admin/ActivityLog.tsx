"use client"

import React, { useMemo, useCallback, useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityLogEntry, ApiResponse } from "@/types/api"
import { useDebounce } from "@/hooks/use-debounce"

// Interface for filters
interface ActivityFilters {
  action?: string;
  username?: string;
  page: number;
  pageSize: number;
}

// Change to named export
export function ActivityLog() {
  // ... rest of the component code remains the same ...
  
  // State management
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 0,
    pageSize: 10,
  })
  
  // Search input state
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 500)

  // Update username filter when debounced search changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      username: debouncedSearch || undefined,
      page: 0, // Reset to first page on search
    }))
  }, [debouncedSearch])

  // Fetch activity logs with filters
  const { data: response, isLoading } = useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: filters.page.toString(),
        size: filters.pageSize.toString(),
      }
      
      if (filters.action) params.action = filters.action
      if (filters.username) params.username = filters.username

      return apiClient.get<ActivityLogEntry[]>('/activity-logs', params)
    },
  })

  // Table columns definition
  const columns = useMemo<ColumnDef<ActivityLogEntry>[]>(() => [
    {
      accessorKey: "username",
      header: "User",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.username}</div>
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
          {row.original.videoTitle}
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

  // Event handlers
  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }, [])

  const handlePageSizeChange = useCallback((newSize: string) => {
    setFilters(prev => ({
      ...prev,
      pageSize: parseInt(newSize, 10),
      page: 0, // Reset to first page when changing page size
    }))
  }, [])

  const handleActionFilterChange = useCallback((action: string) => {
    setFilters(prev => ({
      ...prev,
      action: action === 'all' ? undefined : action,
      page: 0, // Reset to first page when changing filter
    }))
  }, [])

  // Get data from response
  const logs = response?.data ?? []
  const pageInfo = response?.pageInfo

  // Initialize table
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Select
              value={filters.action || 'all'}
              onValueChange={handleActionFilterChange}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by username"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-[200px]"
            />
          </div>
        </div>
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
                value={filters.pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={filters.pageSize} />
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
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 0 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: pageInfo.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={filters.page === i ? "default" : "outline"}
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
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= pageInfo.totalPages - 1 || isLoading}
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