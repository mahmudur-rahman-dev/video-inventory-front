"use client"

import { useState, useCallback, useMemo } from "react"
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

type TabValue = "assigned" | "player"

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<TabValue>("assigned")
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  const { data: videosResponse, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['assigned-videos', user?.id],
    queryFn: () => apiClient.get<Video[]>('/videos/user-videos'),
    enabled: !!user?.id,
  })

  const videos = useMemo(() => videosResponse?.data ?? [], [videosResponse?.data])

  const initialVideoId = useMemo(() => {
    if (!selectedVideoId && videos.length > 0) {
      return videos[0].id
    }
    return selectedVideoId
  }, [videos, selectedVideoId])

  const handleVideoSelect = useCallback((video: Video) => {
    setSelectedVideoId(video.id)
    setActiveTab("player")
  }, [])

  const handleVideoChange = useCallback((videoId: string) => {
    setSelectedVideoId(videoId)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [logout, router])

  if (!isAuthenticated || !user?.roles.includes('ROLE_USER')) {
    return null
  }

  if (isLoadingVideos) {
    return (
      <Container>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading 
          title="User Dashboard" 
          description={`Welcome Back ${user?.username}`}
        />
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Assigned Videos
          </TabsTrigger>
          <TabsTrigger 
            value="player" 
            className="flex items-center gap-2"
            disabled={videos.length === 0}
          >
            <FileVideo className="h-4 w-4" />
            Video Player
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned">
          {videos.length === 0 ? (
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
              onSelectVideo={handleVideoSelect}
            />
          )}
        </TabsContent>

        <TabsContent value="player">
          {videos.length > 0 && initialVideoId && (
            <VideoPlayerWithList 
              videos={videos}
              initialVideoId={initialVideoId}
              onVideoChange={handleVideoChange}
            />
          )}
        </TabsContent>
      </Tabs>
    </Container>
  )
}