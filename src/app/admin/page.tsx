"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Container } from "@/components/ui/container"
import { Navbar } from "@/components/navbar"
import { VideoList } from "@/components/videos/VideoList"
import { useAuth } from "@/hooks/useAuth"

export default function AdminDashboard() {
  const { isAuthenticated, userRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      router.push('/login')
    }
  }, [isAuthenticated, userRole, router])

  if (!isAuthenticated || userRole !== 'admin') {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Container>
        <div className="space-y-4 p-8 pt-6">
          <Heading title="Admin Dashboard" description="Welcome to VI-MG Admin" />
          <VideoList />
        </div>
      </Container>
    </div>
  )
}