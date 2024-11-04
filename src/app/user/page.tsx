import { Metadata } from "next"
import UserDashboard from "@/components/user/UserDashboard"

export const metadata: Metadata = {
  title: "User Dashboard | Video Inventory Management",
  description: "View your assigned videos and activity log",
}

export default function UserPage() {
  return <UserDashboard />
}