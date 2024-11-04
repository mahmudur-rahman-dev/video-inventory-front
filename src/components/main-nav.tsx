"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const { userRole } = useAuth()

  const adminRoutes = [
    {
      href: `/admin`,
      label: 'Dashboard',
      active: pathname === `/admin`,
    },
    {
      href: `/admin/videos`,
      label: 'Manage Videos',
      active: pathname === `/admin/videos`,
    },
    {
      href: `/admin/users`,
      label: 'Manage Users',
      active: pathname === `/admin/users`,
    },
    {
      href: `/admin/activity`,
      label: 'Activity Logs',
      active: pathname === `/admin/activity`,
    },
  ]

  const userRoutes = [
    {
      href: `/dashboard`,
      label: 'My Videos',
      active: pathname === `/dashboard`,
    },
  ]

  const routes = userRole === 'admin' ? adminRoutes : userRoutes

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active ? 'text-black dark:text-white' : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}