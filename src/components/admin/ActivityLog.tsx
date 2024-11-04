"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"

interface ActivityLogEntry {
  id: string
  userId: string
  videoId: string
  action: 'viewed' | 'updated'
  timestamp: string
}

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])
  const { userRole } = useAuth()

  useEffect(() => {
    if (userRole !== "admin") return

    // In a real application, you would fetch this data from an API
    setLogs([
      { id: "1", userId: "1", videoId: "1", action: "viewed", timestamp: "2023-11-01T12:00:00Z" },
      { id: "2", userId: "2", videoId: "2", action: "updated", timestamp: "2023-11-02T14:30:00Z" },
    ])
  }, [userRole])

  if (userRole !== "admin") {
    return null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User ID</TableHead>
          <TableHead>Video ID</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.userId}</TableCell>
            <TableCell>{log.videoId}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}