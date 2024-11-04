"use client"

import { useState } from "react"
import { VideoPlayer } from "./VideoPlayer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
}

interface VideoListProps {
  videos: Video[]
}

export function VideoList({ videos }: VideoListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)

  return (
    <div className="space-y-8">
      {selectedVideo && (
        <VideoPlayer
          src={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id}>
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{video.description}</p>
              <Button onClick={() => setSelectedVideo(video)}>
                {selectedVideo?.id === video.id ? "Now Playing" : "Watch Video"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}