import { useState, useEffect } from "react"
import { VideoPlayer } from "./VideoPlayer"
import { VideoList } from "./VideoList"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import type { Video } from "@/types/api"

interface VideoPlayerWithListProps {
  videos: Video[]
  initialVideoId: string
  onVideoChange?: (videoId: string) => void
}

export function VideoPlayerWithList({ 
  videos, 
  initialVideoId, 
  onVideoChange 
}: VideoPlayerWithListProps) {
  const [selectedVideo, setSelectedVideo] = useState(
    videos.find(v => v.id === initialVideoId) || videos[0]
  )

  useEffect(() => {
    const video = videos.find(v => v.id === initialVideoId)
    if (video) {
      setSelectedVideo(video)
    }
  }, [initialVideoId, videos])

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    onVideoChange?.(video.id)
  }

  if (!selectedVideo) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Video Player Area */}
      <div className="lg:col-span-3 space-y-4">
        <VideoPlayer
          src={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
        />
        <div className="p-4 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
          <p className="text-muted-foreground">{selectedVideo.description}</p>
        </div>
      </div>

      {/* Video List Sidebar */}
      <div className="lg:col-span-1">
        <VideoList 
          videos={videos}
          selectedVideoId={selectedVideo.id}
          onVideoSelect={handleVideoSelect}
        />
      </div>
    </div>
  )
}