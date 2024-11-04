"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignedVideos } from "@/components/user/AssignedVideos"
import { VideoPlayerWithList } from "@/components/videos/VideoPlayerWithList"
import { ActivityLog } from "@/components/user/ActivityLog"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { dummyAssignedVideos } from "@/lib/dummy-data"

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("assigned")
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const { isAuthenticated, userRole, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || userRole !== "user") {
      router.push("/login")
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== "user") {
    return null
  }

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideoId(videoId)
    setActiveTab("player")
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading title="User Dashboard"/>
        <Button onClick={logout}>Logout</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="assigned">Assigned Videos</TabsTrigger>
          <TabsTrigger value="player">Video Player</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="assigned">
          <AssignedVideos videos={dummyAssignedVideos} onSelectVideo={(video) => handleVideoSelect(video.id)} />
        </TabsContent>
        <TabsContent value="player">
          {selectedVideoId ? (
            <VideoPlayerWithList videos={dummyAssignedVideos} initialVideoId={selectedVideoId} />
          ) : (
            <p>Please select a video from the Assigned Videos tab.</p>
          )}
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </Container>
  )
}