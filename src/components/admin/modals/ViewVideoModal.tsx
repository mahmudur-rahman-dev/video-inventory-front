import { memo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VideoPlayer } from "@/components/videos/VideoPlayer"
import { cn } from "@/lib/utils"
import type { Video } from "@/types/api"

interface ViewVideoModalProps {
  video: Video | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export const ViewVideoModal = memo(function ViewVideoModal({
  video,
  isOpen,
  onOpenChange,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: ViewVideoModalProps) {
  const handleOpenChange = useCallback((open: boolean) => {
    // Add any cleanup logic here if needed
    onOpenChange(open)
  }, [onOpenChange])

  if (!video) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl p-0",
        // Remove max-h constraint when in fullscreen
        "data-[state=open]:max-h-[90vh]" 
      )}>
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {video.title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <VideoPlayer
            src={video.videoUrl}
            title={video.title}
            videoId={video.id}
            onNext={onNext}
            onPrevious={onPrevious}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            disableLogging={true} // Disable logging for admin view
            autoplay={false}
          />

          {/* Video Information */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {video.description}
            </p>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Added: {new Date(video.createdAt).toLocaleDateString()}</span>
              {video.modificationDate && (
                <span>
                  Last modified: {new Date(video.modificationDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})