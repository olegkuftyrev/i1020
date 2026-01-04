"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/src/stores/authStore"
import { authApi } from "@/src/lib/api"
import { DashboardContent } from "@/src/components/DashboardContent"
import { DashboardNavbar } from "@/src/components/DashboardNavbar"

export function DashboardView() {
  const router = useRouter()
  const { user, setUser, setLoading, logout: logoutStore } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const data = await authApi.me()
      setUser(data.user)
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/auth")
      } else {
        toast.error(err.message || "Failed to load user information")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logoutStore()
      router.push("/auth")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-1">
        <DashboardContent user={user} onLogout={handleLogout} />
      </main>
    </div>
  )
}

