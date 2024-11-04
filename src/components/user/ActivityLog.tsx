import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ActivityLogEntry {
  id: string
  videoId: string
  videoTitle: string
  action: 'viewed' | 'updated'
  timestamp: string
}

const dummyActivityLog: ActivityLogEntry[] = [
  { id: "1", videoId: "1", videoTitle: "Introduction to React", action: "viewed", timestamp: "2023-11-01T12:00:00Z" },
  { id: "2", videoId: "2", videoTitle: "Advanced TypeScript Techniques", action: "viewed", timestamp: "2023-11-02T14:30:00Z" },
  { id: "3", videoId: "1", videoTitle: "Introduction to React", action: "viewed", timestamp: "2023-11-03T10:15:00Z" },
]

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([])

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setLogs(dummyActivityLog)
    }, 1000)
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Video Title</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Timestamp</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.videoTitle}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}