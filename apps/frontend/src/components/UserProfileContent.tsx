"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { User } from "@/src/lib/api"

interface UserProfileContentProps {
  user: User | null
  isLoading: boolean
}

export function UserProfileContent({ user, isLoading }: UserProfileContentProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-destructive">User not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FieldGroup>
              <Field>
                <FieldLabel>User ID</FieldLabel>
                <div className="px-4 py-3 bg-muted border rounded-md text-sm font-mono">
                  {user.id}
                </div>
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <div className="px-4 py-3 bg-muted border rounded-md text-sm">
                  {user.email}
                </div>
              </Field>

              <Field>
                <FieldLabel>Name</FieldLabel>
                <div className="px-4 py-3 bg-muted border rounded-md text-sm">
                  {user.name || "Not provided"}
                </div>
              </Field>

              {user.roles && user.roles.length > 0 && (
                <Field>
                  <FieldLabel>Roles</FieldLabel>
                  <div className="px-4 py-3 bg-muted border rounded-md">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-md text-sm font-medium"
                        >
                          {role.name} ({role.slug})
                        </span>
                      ))}
                    </div>
                  </div>
                </Field>
              )}

              {user.stores && user.stores.length > 0 && (
                <Field>
                  <FieldLabel>Stores</FieldLabel>
                  <div className="px-4 py-3 bg-muted border rounded-md">
                    <div className="flex flex-col gap-3">
                      {user.stores.map((userStore) => (
                        <div
                          key={userStore.id}
                          className="p-3 bg-background border border-primary/20 rounded-md"
                        >
                          {userStore.store ? (
                            <>
                              <div className="font-medium text-foreground">
                                {userStore.store.name} ({userStore.store.code})
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Role: <span className="text-primary">{userStore.role}</span>
                                {userStore.store.timezone && (
                                  <> • Timezone: {userStore.store.timezone}</>
                                )}
                                {userStore.store.isActive !== undefined && (
                                  <> • Status: {userStore.store.isActive ? 'Active' : 'Inactive'}</>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Store ID: {userStore.storeId} • Role: {userStore.role}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Field>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

