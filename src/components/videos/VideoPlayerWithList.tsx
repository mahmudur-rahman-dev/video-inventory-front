import { useState, useEffect, useCallback } from "react"
import { VideoPlayer } from "./VideoPlayer"
import { VideoList } from "./VideoList"
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
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(
    videos.findIndex(v => v.id === initialVideoId)
  )

  useEffect(() => {
    const index = videos.findIndex(v => v.id === initialVideoId)
    if (index !== -1) {
      setSelectedVideoIndex(index)
    }
  }, [initialVideoId, videos])

  const handleVideoSelect = useCallback((video: Video) => {
    const index = videos.findIndex(v => v.id === video.id)
    setSelectedVideoIndex(index)
    onVideoChange?.(video.id)
  }, [videos, onVideoChange])

  const handleNext = useCallback(() => {
    if (selectedVideoIndex < videos.length - 1) {
      const nextIndex = selectedVideoIndex + 1
      setSelectedVideoIndex(nextIndex)
      onVideoChange?.(videos[nextIndex].id)
    }
  }, [selectedVideoIndex, videos, onVideoChange])

  const handlePrevious = useCallback(() => {
    if (selectedVideoIndex > 0) {
      const prevIndex = selectedVideoIndex - 1
      setSelectedVideoIndex(prevIndex)
      onVideoChange?.(videos[prevIndex].id)
    }
  }, [selectedVideoIndex, videos, onVideoChange])

  const selectedVideo = videos[selectedVideoIndex]

  if (!selectedVideo) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Video Player Area */}
      <div className="lg:col-span-3 space-y-4">
        <VideoPlayer
          key={selectedVideo.id}
          src={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={selectedVideoIndex < videos.length - 1}
          hasPrevious={selectedVideoIndex > 0}
          autoplay={false}
        />
        <div className="p-4 bg-card rounded-lg border">
          <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
          <p className="text-muted-foreground">{selectedVideo.description}</p>
          <div className="mt-2 text-sm text-muted-foreground">
            Added on {new Date(selectedVideo.createdAt).toLocaleDateString()}
          </div>
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