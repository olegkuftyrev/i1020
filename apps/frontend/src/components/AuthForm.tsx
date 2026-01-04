"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { useAuthStore } from "@/src/stores/authStore"

interface AuthFormProps {
  isLogin: boolean
  onToggleMode: () => void
  onSubmit: (email: string, password: string, name?: string) => void
}

export function AuthForm({
  isLogin,
  onToggleMode,
  onSubmit,
}: AuthFormProps) {
  const { isLoading } = useAuthStore()
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password, isLogin ? undefined : name)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/30 shadow-2xl shadow-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-xl font-bold">
                    {isLogin ? "Welcome to i1020" : "Create an account"}
                  </h1>
                  <FieldDescription>
                    {isLogin ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          type="button"
                          onClick={onToggleMode}
                          className="text-primary hover:underline font-medium underline-offset-4"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={onToggleMode}
                          className="text-primary hover:underline font-medium underline-offset-4"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </FieldDescription>
                </div>
                {!isLogin && (
                  <Field>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </Field>
                )}
                <Field>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? "Loading..."
                      : isLogin
                      ? "Login"
                      : "Create account"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
              personal use only
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

