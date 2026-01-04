"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/src/stores/authStore"
import { DashboardNavbar } from "@/src/components/DashboardNavbar"
import { StoresContent } from "@/src/components/StoresContent"

export function StoresView() {
  const router = useRouter()
  const { user, setUser, setLoading } = useAuthStore()
  const [loading, setLoadingState] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoadingState(true)
    try {
      const { authApi } = await import("@/src/lib/api")
      const data = await authApi.me()
      console.log('Fetched user data:', data.user)
      console.log('User stores:', data.user.stores)
      if (data.user.stores && data.user.stores.length > 0) {
        console.log('First store:', data.user.stores[0])
        console.log('Store object:', data.user.stores[0].store)
      }
      setUser(data.user)
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/auth")
      } else {
        toast.error(err.message || "Failed to load user information")
      }
    } finally {
      setLoadingState(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-1">
        <StoresContent user={user} isLoading={loading} />
      </main>
    </div>
  )
}

