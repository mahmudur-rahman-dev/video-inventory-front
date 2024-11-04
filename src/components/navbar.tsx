"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { MainNav } from "@/components/main-nav"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"

export const Navbar = () => {
  const { logout, userRole } = useAuth()

  return (
    <div className="border-b">
      <Container>
        <div className="flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">
            VI-MG {userRole === 'admin' ? 'Admin' : 'User'}
          </Link>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <Button onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}