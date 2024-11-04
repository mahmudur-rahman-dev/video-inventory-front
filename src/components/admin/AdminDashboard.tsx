"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoUpload } from "@/components/admin/VideoUpload"
import { VideoManagement } from "@/components/admin/VideoManagement"
import { UserAssignment } from "@/components/admin/UserAssignment"
import { ActivityLog } from "@/components/admin/ActivityLog"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("upload")
  const { isAuthenticated, userRole, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || userRole !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== "admin") {
    return null
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading title="Admin Dashboard" description="Welcome to VI-MG Admin Dashboard" />
        <Button onClick={logout}>Logout</Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="manage">Manage Videos</TabsTrigger>
          <TabsTrigger value="assign">Assign Videos</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <VideoUpload />
        </TabsContent>
        <TabsContent value="manage">
          <VideoManagement />
        </TabsContent>
        <TabsContent value="assign">
          <UserAssignment />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </Container>
  )
}