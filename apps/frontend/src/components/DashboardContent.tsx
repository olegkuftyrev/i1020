"use client"

import { useAuthStore } from "@/src/stores/authStore"
import { User } from "@/src/lib/api"

interface DashboardContentProps {
  user: User | null
  onLogout?: () => void
}

export function DashboardContent({ user, onLogout }: DashboardContentProps) {
  const { isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-primary">dashboard</h1>
    </div>
  )
}
