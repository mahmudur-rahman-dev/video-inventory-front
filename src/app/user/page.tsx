"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Container } from "@/components/ui/container"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/hooks/useAuth"
import { VideoList } from "@/components/videos/VideoList"

export default function UserDashboard() {
  const { isAuthenticated, userRole, assignedVideos } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'user') {
      router.push('/login')
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== 'user') {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Container>
        <div className="space-y-4 p-8 pt-6">
          <Heading title="Your Assigned Videos" description="Click on a video to watch" />
          <VideoList videos={assignedVideos} isUserView={true} />
        </div>
      </Container>
    </div>
  )
}