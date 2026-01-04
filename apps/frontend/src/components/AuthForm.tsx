"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { useAuthStore } from "@/src/stores/authStore"

interface AuthFormProps {
  isLogin: boolean
  onToggleMode: () => void
  onSubmit: (email: string, password: string, fullName?: string) => void
  success?: string
}

export function AuthForm({
  isLogin,
  onToggleMode,
  onSubmit,
  success,
}: AuthFormProps) {
  const { isLoading, error } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password, isLogin ? undefined : fullName)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 p-3 rounded-md">
                    {success}
                  </div>
                )}
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? "Loading..."
                      : isLogin
                      ? "Login"
                      : "Create account"}
                  </Button>
                </Field>
                {isLogin && (
                  <>
                    <FieldSeparator>Or</FieldSeparator>
                    <Field className="grid gap-4 sm:grid-cols-2">
                      <Button variant="outline" type="button" className="w-full">
                        Continue with Apple
                      </Button>
                      <Button variant="outline" type="button" className="w-full">
                        Continue with Google
                      </Button>
                    </Field>
                  </>
                )}
              </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
              By clicking continue, you agree to our{" "}
              <a href="#" className="text-primary hover:underline underline-offset-4">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline underline-offset-4">
                Privacy Policy
              </a>
              .
            </FieldDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

