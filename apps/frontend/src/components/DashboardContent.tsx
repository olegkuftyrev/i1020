"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useAuthStore } from "@/src/stores/authStore"
import { User } from "@/src/lib/api"

interface DashboardContentProps {
  user: User | null
  onLogout: () => void
}

export function DashboardContent({ user, onLogout }: DashboardContentProps) {
  const { isLoading, error } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            User Information
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
                {user?.fullName || "Not provided"}
              </div>
            </Field>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}
            <Field className="mt-2">
              <Button onClick={onLogout} variant="outline" className="w-full h-11 text-base">
                Logout
              </Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}

