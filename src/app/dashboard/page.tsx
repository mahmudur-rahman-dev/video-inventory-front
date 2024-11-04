"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heading } from "@/components/ui/heading"
import { Container } from "@/components/ui/container"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/providers/auth-provider"

export default function UserDashboard() {
  const { isAuthenticated, userRole } = useAuth()
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
          <Heading title="User Dashboard" description="Welcome to VI-MG User Dashboard" />
          {/* Add user-specific content here */}
        </div>
      </Container>
    </div>
  )
}