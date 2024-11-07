import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileVideo, Calendar } from "lucide-react"
import type { Video } from "@/types/api"

interface AssignedVideosProps {
  videos: Video[]
  onSelectVideo: (video: Video) => void
}

export function AssignedVideos({ videos, onSelectVideo }: AssignedVideosProps) {
  return (
    <div className="space-y-6">
      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Videos Found</p>
            <p className="text-sm text-muted-foreground">
              No videos have been assigned to you yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="transition-all hover:shadow-md"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                </div>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {video.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onSelectVideo(video)}
                >
                  <FileVideo className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}