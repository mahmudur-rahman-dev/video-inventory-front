import { useState, useRef } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize 
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/providers/auth-provider"

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
  const { user } = useAuth()
  const { toast } = useToast()

  // Get video URL similar to admin dashboard
  const getVideoUrl = (videoUrl: string) => {
    const baseUrl = process.env.NEXT_VIDEO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/uploads/${videoUrl}`;
  };

  // Log video view when playback starts
  const handlePlay = async () => {
    setIsPlaying(true)
    try {
      await apiClient.post('/activity-logs', {
        videoId,
        action: 'viewed',
        userId: user?.id
      })
    } catch (error) {
      console.error('Failed to log video view:', error)
    }
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
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={getVideoUrl(src)}
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
                controlsList: 'nodownload',
                disablePictureInPicture: true,
              }
            }
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress bar */}
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={(value) => {
              const [newProgress] = value
              playerRef.current?.seekTo(newProgress / 100)
            }}
            className="mb-4"
          />
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-white"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={(value) => handleVolumeChange([value[0] / 100])}
                />
              </div>

              <span className="text-white text-sm">
                {formatTime(progress * duration / 100)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}