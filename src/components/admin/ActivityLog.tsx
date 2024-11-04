// src/components/admin/ActivityLog.tsx
"use client"

import { useState, useEffect } from "react"
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
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"
import type { ActivityLogEntry } from "@/types/api"
import { Input } from "@/components/ui/input"

interface ActivityFilter {
  action?: string;
  userId?: string;
  videoId?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<ActivityFilter>({
    dateRange: 'all'
  })
  const { toast } = useToast()

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      // Construct query params based on filters
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.videoId) params.append('videoId', filters.videoId)
      if (filters.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange)
      }

      const response = await apiClient.get<ActivityLogEntry[]>(`/activity-logs?${params}`)
      if (response.success) {
        setLogs(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filters])

  const getActionColor = (action: string) => {
    switch (action) {
      case 'viewed':
        return 'text-blue-600'
      case 'updated':
        return 'text-amber-600'
      case 'deleted':
        return 'text-red-600'
      case 'assigned':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Activity Log</CardTitle>
          <div className="flex gap-4">
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value: 'today' | 'week' | 'month' | 'all') => 
                setFilters(prev => ({ ...prev, dateRange: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by user or video"
              className="max-w-[200px]"
              onChange={(e) => {
                const value = e.target.value
                setFilters(prev => ({
                  ...prev,
                  userId: value,
                  videoId: value
                }))
              }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.username}</TableCell>
                      <TableCell>
                        <span className={getActionColor(log.action)}>
                          {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{log.videoTitle}</TableCell>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}