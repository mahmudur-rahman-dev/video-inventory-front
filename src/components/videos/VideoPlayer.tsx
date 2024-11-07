import { useState, useRef, useCallback, useEffect } from "react"
import ReactPlayer from "react-player"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack, 
  SkipForward, 
  Settings
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/providers/auth-provider"

interface VideoPlayerProps {
  src: string
  title: string
  videoId: string
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  autoplay?: boolean
  disableLogging?: boolean
}

interface PlayerState {
  playing: boolean
  volume: number
  muted: boolean
  played: number
  loaded: number
  duration: number
  playbackRate: number
  fullscreen: boolean
  hasLogged: boolean
}

const initialPlayerState: PlayerState = {
  playing: false,
  volume: 0.7,
  muted: false,
  played: 0,
  loaded: 0,
  duration: 0,
  playbackRate: 1.0,
  fullscreen: false,
  hasLogged: false
}

export function VideoPlayer({ 
  src, 
  title, 
  videoId,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  autoplay = false,
  disableLogging = false
}: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playerState, setPlayerState] = useState<PlayerState>(initialPlayerState)
  const { user } = useAuth()
  const { toast } = useToast()

  // Reset player state when video changes
  useEffect(() => {
    setPlayerState(prev => ({
      ...initialPlayerState,
      volume: prev.volume,
      muted: prev.muted
    }))
  }, [src])

  // Get video URL
  const getVideoUrl = useCallback((videoUrl: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_VIDEO_API_BASE_URL || 'http://localhost:8080'
    return `${baseUrl}/uploads/${videoUrl}`
  }, [])

  // Log video view
  const logVideoView = useCallback(async () => {
    if (disableLogging || playerState.hasLogged) return

    try {
      const response = await apiClient.post('/activity-logs', {
        videoId,
        action: 'viewed',
        userId: user?.id,
        timestamp: new Date().toISOString()
      })

      if (response.success) {
        setPlayerState(prev => ({ ...prev, hasLogged: true }))
        console.log('Video view logged successfully')
      } else {
        console.error('Failed to log video view:', response.message)
      }
    } catch (error) {
      console.error('Error logging video view:', error)
    }
  }, [videoId, user?.id, disableLogging, playerState.hasLogged])

  // Handle player state changes
  const handlePlayPause = useCallback(() => {
    setPlayerState(prev => {
      const newPlaying = !prev.playing
      if (newPlaying && !prev.hasLogged && !disableLogging) {
        logVideoView()
      }
      return { ...prev, playing: newPlaying }
    })
  }, [logVideoView, disableLogging])

  const handleProgress = useCallback(({ played, loaded }: { played: number; loaded: number }) => {
    setPlayerState(prev => ({
      ...prev,
      played: played * 100,
      loaded: loaded * 100
    }))
  }, [])

  const handleVolumeChange = useCallback((value: number[]) => {
    setPlayerState(prev => ({
      ...prev,
      volume: value[0] / 100,
      muted: value[0] === 0
    }))
  }, [])

  const handleSeek = useCallback((value: number[]) => {
    const seekTo = value[0] / 100
    playerRef.current?.seekTo(seekTo)
    setPlayerState(prev => ({ ...prev, played: value[0] }))
  }, [])

  const toggleMute = useCallback(() => {
    setPlayerState(prev => ({
      ...prev,
      muted: !prev.muted,
      volume: prev.muted ? 0.7 : 0
    }))
  }, [])

  const handlePlaybackRateChange = useCallback(() => {
    setPlayerState(prev => {
      const newRate = prev.playbackRate >= 2 ? 1 : prev.playbackRate + 0.5
      return { ...prev, playbackRate: newRate }
    })
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen()
        setPlayerState(prev => ({ ...prev, fullscreen: true }))
      } else {
        await document.exitFullscreen()
        setPlayerState(prev => ({ ...prev, fullscreen: false }))
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }, [])

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }
    return `${mm}:${ss}`
  }, [])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if focus is on an input element
      if (document.activeElement?.tagName === 'INPUT') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          handlePlayPause()
          break
        case 'ArrowLeft':
          if (hasPrevious && onPrevious) {
            e.preventDefault()
            onPrevious()
          }
          break
        case 'ArrowRight':
          if (hasNext && onNext) {
            e.preventDefault()
            onNext()
          }
          break
        case 'KeyM':
          toggleMute()
          break
        case 'KeyF':
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePlayPause, toggleMute, toggleFullscreen, hasPrevious, hasNext, onNext, onPrevious])

  // Handle autoplay
  useEffect(() => {
    if (autoplay) {
      setPlayerState(prev => ({ ...prev, playing: true }))
      if (!disableLogging) {
        logVideoView()
      }
    }
  }, [autoplay, logVideoView, disableLogging])

  return (
    <Card className="overflow-hidden">
      <div ref={containerRef} className="relative aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={getVideoUrl(src)}
          width="100%"
          height="100%"
          playing={playerState.playing}
          volume={playerState.volume}
          muted={playerState.muted}
          playbackRate={playerState.playbackRate}
          onProgress={handleProgress}
          onDuration={(duration) => setPlayerState(prev => ({ ...prev, duration }))}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
                playsInline: true,
                crossOrigin: "anonymous",
              },
            }
          }}
          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        />
        
        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress bar */}
          <Slider
            value={[playerState.played]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="mb-4"
          />
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:text-white"
              >
                {playerState.playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              {/* Previous/Next */}
              {(hasPrevious || hasNext) && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className="text-white hover:text-white"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNext}
                    disabled={!hasNext}
                    className="text-white hover:text-white"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:text-white"
                >
                  {playerState.muted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[playerState.volume * 100]}
                  max={100}
                  step={1}
                  className="w-24"
                  onValueChange={handleVolumeChange}
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-sm">
                {formatTime(playerState.played * playerState.duration / 100)} / {formatTime(playerState.duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {/* Settings/Playback Speed */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white"
                onClick={handlePlaybackRateChange}
              >
                <Settings className="h-4 w-4" />
                <span className="ml-1">{playerState.playbackRate}x</span>
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:text-white"
              >
                {playerState.fullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}