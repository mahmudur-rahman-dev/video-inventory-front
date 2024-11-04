import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { sampleVideos } from "@/lib/sample-data"

export function VideoList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleVideos.map((video) => (
          <TableRow key={video.id}>
            <TableCell>{video.title}</TableCell>
            <TableCell>{video.description}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" className="mr-2">Edit</Button>
              <Button variant="destructive" size="sm">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}