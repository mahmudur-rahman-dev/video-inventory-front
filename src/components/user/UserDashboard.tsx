"use client"

import { useCallback, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignedVideos } from "@/components/user/AssignedVideos"
import { VideoPlayerWithList } from "@/components/videos/VideoPlayerWithList"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { FileVideo, List, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Video } from "@/types/api"

export default function UserDashboard() {
  // Persist active tab and selected video in localStorage
  const [activeTab, setActiveTab] = useLocalStorage("user-dashboard-tab", "assigned")
  const [selectedVideoId, setSelectedVideoId] = useLocalStorage<string | null>("selected-video-id", null)
  
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  // Fetch assigned videos for the user
  const { data: videosResponse, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['assigned-videos', user?.id],
    queryFn: () => apiClient.get<Video[]>('/videos/user-videos'),
    enabled: !!user?.id,
  })

  const videos = videosResponse?.data ?? []

  // Set initial video if none selected and videos are available
  useEffect(() => {
    if (videos.length > 0 && !selectedVideoId) {
      setSelectedVideoId(videos[0].id)
    }
  }, [videos, selectedVideoId, setSelectedVideoId])

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideoId(videoId)
    setActiveTab("player")
  }, [setSelectedVideoId, setActiveTab])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (!isAuthenticated || !user?.roles.includes('ROLE_USER')) {
    return null
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading 
          title="User Dashboard" 
          description={`Welcome back, ${user.username}`}
        />
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Assigned Videos
          </TabsTrigger>
          <TabsTrigger 
            value="player" 
            className="flex items-center gap-2"
            // Remove the disabled condition since we'll always have a selected video when videos are available
          >
            <FileVideo className="h-4 w-4" />
            Video Player
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          {isLoadingVideos ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </CardContent>
            </Card>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Videos Assigned</p>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any videos assigned to you yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <AssignedVideos 
              videos={videos}
              // selectedVideoId={selectedVideoId} // Add this prop
              onSelectVideo={(video) => handleVideoSelect(video.id)} 
            />
          )}
        </TabsContent>

        <TabsContent value="player">
          {videos.length > 0 ? (
            <VideoPlayerWithList 
              videos={videos}
              initialVideoId={selectedVideoId || videos[0].id} // Fallback to first video if none selected
              onVideoChange={setSelectedVideoId}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Videos Available</p>
                <p className="text-sm text-muted-foreground">
                  No videos have been assigned to you yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  )
}