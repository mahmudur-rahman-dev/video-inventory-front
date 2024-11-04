"use client"

import { useState, useRef } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { logActivity } from "@/lib/api"

interface VideoPlayerProps {
  src: string
  title: string
  videoId: string
}

export function VideoPlayer({ src, title, videoId }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { userRole } = useAuth()

  const handlePlay = () => {
    setIsPlaying(true)
    logActivity(videoId, 'viewed')
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played * 100)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(value[0] === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setVolume(isMuted ? 0.5 : 0)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      playerRef.current?.getInternalPlayer()?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }
    return `${mm}:${ss}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-100 rounded-lg overflow-hidden shadow-lg">
      <h2 className="text-2xl font-bold p-4 bg-gray-200">{title}</h2>
      <div className="relative aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={src}
          width="100%"
          height="100%"
          playing={isPlaying}
          volume={volume}
          muted={isMuted}
          onPlay={handlePlay}
          onPause={handlePause}
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-50 text-white p-2">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <span>{formatTime(progress * duration / 100)} / {formatTime(duration)}</span>
          </div>
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={(value) => {
              const [newProgress] = value
              playerRef.current?.seekTo(newProgress / 100)
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                className="w-24 ml-2"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </div>
        </div>
      </div>
      {userRole === 'admin' && (
        <div className="p-4 bg-gray-200">
          <p className="text-sm text-gray-600">Admin: Video ID {videoId}</p>
        </div>
      )}
    </div>
  )
}