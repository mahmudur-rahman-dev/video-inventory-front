"use client"

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "./VideoPlayer"

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
}

interface VideoListProps {
  videos: Video[];
  isUserView?: boolean;
}

export function VideoList({ videos, isUserView = false }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return (
    <>
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
                {isUserView ? (
                  <Button onClick={() => setSelectedVideo(video)}>Watch</Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedVideo && (
        <VideoPlayer 
          videoUrl={selectedVideo.videoUrl} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </>
  )
}