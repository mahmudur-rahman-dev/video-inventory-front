"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
}

export function VideoManagement() {
  const [videos, setVideos] = useState<Video[]>([])
  const { userRole } = useAuth()

  useEffect(() => {
    // In a real application, you would fetch videos from an API
    setVideos([
      { id: "1", title: "Introduction to React", description: "Learn the basics of React", videoUrl: "https://example.com/video1.mp4" },
      { id: "2", title: "Advanced TypeScript", description: "Deep dive into TypeScript", videoUrl: "https://example.com/video2.mp4" },
    ])
  }, [])

  const handleDelete = async (id: string) => {
    if (userRole !== "admin") return
    // In a real application, you would call an API to delete the video
    setVideos(videos.filter(video => video.id !== id))
  }

  const handleEdit = async (id: string) => {
    if (userRole !== "admin") return
    // Implement edit logic, e.g., open a modal with edit form
    console.log("Editing video with id:", id)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => (
          <TableRow key={video.id}>
            <TableCell>{video.title}</TableCell>
            <TableCell>{video.description}</TableCell>
            <TableCell>
              <Button variant="ghost" onClick={() => handleEdit(video.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" onClick={() => handleDelete(video.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}