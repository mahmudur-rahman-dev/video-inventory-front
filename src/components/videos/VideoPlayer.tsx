"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  videoUrl: string;
  onClose: () => void;
}

export function VideoPlayer({ videoUrl, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    const video = document.querySelector('video')
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
        <video src={videoUrl} className="w-full" controls={false}>
          Your browser does not support the video tag.
        </video>
        <div className="mt-4 flex justify-between">
          <Button onClick={handlePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}