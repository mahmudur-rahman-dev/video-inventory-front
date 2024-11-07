"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import { Progress } from "@/components/ui/progress"
import { useQueryClient } from "@tanstack/react-query"

interface UploadState {
  isUploading: boolean
  progress: number
}

export function VideoUpload() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    try {
      setUploadState({ isUploading: true, progress: 0 })

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('file', file)

      const response = await apiClient.upload<{ id: string }>('/videos/upload', formData)

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ['videos'] })
        
        toast({
          title: "Success",
          description: "Video uploaded successfully",
        })

        setTitle("")
        setDescription("")
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      setUploadState({ isUploading: false, progress: 0 })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Upload New Video</h2>
          <p className="text-sm text-muted-foreground">Add a new video to the inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={uploadState.isUploading}
            placeholder="Enter video title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={uploadState.isUploading}
            placeholder="Enter video description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <Input
            id="video"
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            disabled={uploadState.isUploading}
          />
        </div>

        {uploadState.isUploading && (
          <div className="space-y-2">
            <Progress value={uploadState.progress} />
            <p className="text-sm text-muted-foreground text-center">
              Uploading: {uploadState.progress}%
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={uploadState.isUploading || !file}
          className="w-full"
        >
          {uploadState.isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </>
          )}
        </Button>
      </form>
    </div>
  )
}