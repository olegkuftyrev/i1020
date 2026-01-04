"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { DashboardNavbar } from "@/src/components/DashboardNavbar"
import { User } from "@/src/lib/api"
import { authApi } from "@/src/lib/api"

export function UserView({ userId }: { userId: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    setIsLoading(true)
    try {
      // For now, we'll use the me() endpoint since we don't have a user-by-id endpoint
      // In a real app, you'd have an API endpoint like getUserById(userId)
      const data = await authApi.me()
      // Check if the fetched user matches the requested userId
      if (data.user.id.toString() === userId) {
        setUser(data.user)
      } else {
        toast.error("User not found")
        router.push("/dashboard")
      }
    } catch (err: any) {
      if (err.message === "Unauthorized") {
        router.push("/auth")
      } else {
        toast.error(err.message || "Failed to load user information")
        router.push("/dashboard")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-1">
        <div className="flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>User ID</FieldLabel>
                  <div className="px-4 py-3 bg-muted border rounded-md text-sm font-mono">
                    {user?.id}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <div className="px-4 py-3 bg-muted border rounded-md text-sm">
                    {user?.email}
                  </div>
                </Field>
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <div className="px-4 py-3 bg-muted border rounded-md text-sm">
                    {user?.name || "Not provided"}
                  </div>
                </Field>
              </FieldGroup>
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

