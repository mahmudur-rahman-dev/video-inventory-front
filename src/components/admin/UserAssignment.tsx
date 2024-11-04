"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"

interface Video {
  id: string
  title: string
}

interface User {
  id: string
  username: string
}

export function UserAssignment() {
  const [videos, setVideos] = useState<Video[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedVideo, setSelectedVideo] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const { userRole } = useAuth()

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    setVideos([
      { id: "1", title: "Introduction to React" },
      { id: "2", title: "Advanced TypeScript" },
    ])
    setUsers([
      { id: "1", username: "user1" },
      { id: "2", username: "user2" },
    ])
  }, [])

  const handleAssign = async () => {
    if (!selectedVideo || !selectedUser || userRole !== "admin") return

    // In a real application, you would call an API to assign the video to the user
    console.log(`Assigning video ${selectedVideo} to user ${selectedUser}`)

    // Reset selections
    setSelectedVideo("")
    setSelectedUser("")
  }

  return (
    <div className="space-y-4">
      <div>
        <Select value={selectedVideo} onValueChange={setSelectedVideo}>
          <SelectTrigger>
            <SelectValue placeholder="Select a video" />
          </SelectTrigger>
          <SelectContent>
            {videos.map((video) => (
              <SelectItem key={video.id} value={video.id}>
                {video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleAssign}>Assign Video to User</Button>
    </div>
  )
}