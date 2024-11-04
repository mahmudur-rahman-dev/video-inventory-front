"use client"

import { useState } from "react"
import { VideoPlayer } from "@/components/videos/VideoPlayer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
}

interface VideoPlayerWithListProps {
  videos: Video[]
  initialVideoId: string
}

export function VideoPlayerWithList({ videos, initialVideoId }: VideoPlayerWithListProps) {
  const [selectedVideo, setSelectedVideo] = useState(
    videos.find(v => v.id === initialVideoId) || videos[0]
  )

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="lg:w-3/4">
        <VideoPlayer
          src={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
        />
        <div className="mt-4">
          <h2 className="text-2xl font-bold">{selectedVideo.title}</h2>
          <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
        </div>
      </div>
      <div className="lg:w-1/4">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="pr-4">
            {videos.map((video) => (
              <Card 
                key={video.id} 
                className={`mb-4 cursor-pointer ${video.id === selectedVideo.id ? 'border-primary' : ''}`}
                onClick={() => setSelectedVideo(video)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{video.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-gray-500 truncate">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}