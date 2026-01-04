"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/src/stores/authStore"
import { authApi } from "@/src/lib/api"
import { DashboardNavbar } from "@/src/components/DashboardNavbar"
import { UserProfileContent } from "@/src/components/UserProfileContent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export function UserProfileView() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, setUser, setLoading } = useAuthStore()
  const [user, setUserData] = useState(currentUser)
  const [loading, setLoadingState] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [params.id])

  const fetchUserData = async () => {
    setLoadingState(true)
    try {
      // Use current user if ID matches or if no ID provided
      const userId = params.id as string
      if (userId && userId !== currentUser?.id) {
        // In future, can fetch other users if needed
        // For now, just use current user
        const data = await authApi.me()
        setUserData(data.user)
        setUser(data.user)
      } else {
        // Fetch current user data
        const data = await authApi.me()
        setUserData(data.user)
        setUser(data.user)
      }
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
        <UserProfileContent user={user} isLoading={loading} />
      </main>
    </div>
  )
}

