"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Container } from "@/components/ui/container"
import { Heading } from "@/components/ui/heading"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(username, password)
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <Container>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <Heading title="Login" description="Enter your credentials to access the system" />
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </Container>
  )
}