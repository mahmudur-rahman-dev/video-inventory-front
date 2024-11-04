import { Metadata } from "next"
import AdminDashboard from "@/components/admin/AdminDashboard"

export const metadata: Metadata = {
  title: "Admin Dashboard | Video Inventory Management",
  description: "Manage videos, users, and view activity logs",
}

export default function AdminPage() {
  return <AdminDashboard />
}