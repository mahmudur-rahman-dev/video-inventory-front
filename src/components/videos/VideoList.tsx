import { memo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PlayCircle } from "lucide-react"
import type { Video } from "@/types/api"

interface VideoListProps {
  videos: Video[]
  selectedVideoId: string
  onVideoSelect: (video: Video) => void
}

export const VideoList = memo(function VideoList({ 
  videos, 
  selectedVideoId, 
  onVideoSelect 
}: VideoListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Up Next</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="px-4 pb-4 space-y-2">
          {videos.map((video) => {
            const isSelected = video.id === selectedVideoId
            
            return (
              <Card
                key={video.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-accent",
                  isSelected && "border-primary bg-accent"
                )}
                onClick={() => onVideoSelect(video)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-24 h-16 bg-muted rounded flex items-center justify-center">
                      <PlayCircle className={cn(
                        "w-8 h-8",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium line-clamp-2 text-sm",
                        isSelected && "text-primary"
                      )}>
                        {video.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
})