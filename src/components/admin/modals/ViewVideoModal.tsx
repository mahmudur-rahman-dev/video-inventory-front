import { memo } from "react"
import ReactPlayer from "react-player"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Video } from "@/types/api"

interface ViewVideoModalProps {
    video: Video | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
  }
  
  export const ViewVideoModal = memo(function ViewVideoModal({
    video,
    isOpen,
    onOpenChange,
  }: ViewVideoModalProps) {
    const getVideoUrl = (videoUrl: string | undefined) => {
      if (!videoUrl) return '';
      const baseUrl = process.env.NEXT_VIDEO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      return `${baseUrl}/uploads/${videoUrl}`;
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{video?.title}</DialogTitle>
          </DialogHeader>
          {video && (
            <div className="mt-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
                <ReactPlayer
                  url={getVideoUrl(video.videoUrl)}
                  width="100%"
                  height="100%"
                  controls
                  playsinline
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
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {video.description}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  })