import { dummyAssignedVideos } from "@/lib/dummy-data";

export default function VideoTest() {
    return (
      <div>
        <h1>Video Test</h1>
        {dummyAssignedVideos.map((video) => (
          <div key={video.id}>
            <h2>{video.title}</h2>
            <video src={video.videoUrl} controls width="400">
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    )
  }