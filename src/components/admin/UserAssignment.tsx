// src/components/admin/UserAssignment.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Video, User } from "@/types/api"

interface Assignment {
  id: string;
  videoId: string;
  userId: number;
  assignedAt: string;
  video: Video;
  user: User;
}

export function UserAssignment() {
  const [videos, setVideos] = useState<Video[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedVideo, setSelectedVideo] = useState("")
  const [selectedUser, setSelectedUser] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [videosRes, usersRes, assignmentsRes] = await Promise.all([
        apiClient.get<Video[]>('/videos'),
        apiClient.get<User[]>('/users'),
        apiClient.get<Assignment[]>('/videos/assignments')
      ])

      if (videosRes.success && usersRes.success && assignmentsRes.success) {
        setVideos(videosRes.data)
        // Filter out admin users
        setUsers(usersRes.data)
        setAssignments(assignmentsRes.data)
      }
    } catch (error) {
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch assignment data",
      //   variant: "destructive",
      // })
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssign = async () => {
    if (!selectedVideo || !selectedUser) {
      toast({
        title: "Error",
        description: "Please select both a video and a user",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAssigning(true)

      const response = await apiClient.post<Assignment>(`/videos/${selectedVideo}/assign`, null,  {
        userId: parseInt(selectedUser, 10)
      })

      if (response.success) {
        setAssignments(prev => [...prev, response.data])
        toast({
          title: "Success",
          description: "Video assigned successfully",
        })
        setSelectedVideo("")
        setSelectedUser("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign video",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const response = await apiClient.delete<void>(`/videos/remove-assignment/${assignmentId}`)
      
      if (response.success) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId))
        toast({
          title: "Success",
          description: "Assignment removed successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove assignment",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Videos to Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Video</label>
            <Select
              value={selectedVideo}
              onValueChange={setSelectedVideo}
              disabled={isAssigning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a video" />
              </SelectTrigger>
              <SelectContent>
                {videos
                  .filter(video => !assignments.some(a => a.videoId === video.id))
                  .map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select
              value={selectedUser}
              onValueChange={setSelectedUser}
              disabled={isAssigning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleAssign} 
          disabled={isAssigning || !selectedVideo || !selectedUser}
          className="w-full"
        >
          {isAssigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            'Assign Video to User'
          )}
        </Button>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Current Assignments</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Video</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.video.title}</TableCell>
                      <TableCell>{assignment.user.username}</TableCell>
                      <TableCell>
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}