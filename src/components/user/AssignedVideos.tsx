import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Video {
  id: string
  title: string
  description: string
  videoUrl: string
}

interface AssignedVideosProps {
  videos: Video[]
  onSelectVideo: (video: Video) => void
}

export function AssignedVideos({ videos, onSelectVideo }: AssignedVideosProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card key={video.id}>
          <CardHeader>
            <CardTitle>{video.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{video.description}</p>
            <Button onClick={() => onSelectVideo(video)}>Watch Video</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}