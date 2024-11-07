import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileVideo, Calendar } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import type { Video } from "@/types/api"

interface AssignedVideosProps {
  videos: Video[]
  onSelectVideo: (video: Video) => void
}

type SortOption = "newest" | "oldest" | "title"

export function AssignedVideos({ videos, onSelectVideo }: AssignedVideosProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos]

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      result = result.filter(
        video =>
          video.title.toLowerCase().includes(searchLower) ||
          video.description.toLowerCase().includes(searchLower)
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return result
  }, [videos, debouncedSearch, sortBy])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedVideos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No Videos Found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "No videos have been assigned to you yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedVideos.map((video) => (
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