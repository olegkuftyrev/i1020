"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthStore } from "@/src/stores/authStore"
import { authApi } from "@/src/lib/api"
import { AuthForm } from "@/src/components/AuthForm"

export function AuthView() {
  const router = useRouter()
  const { setUser, setLoading } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)

  const handleSubmit = async (email: string, password: string, name?: string) => {
    setLoading(true)

    try {
      const data = isLogin
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password, name })

      setUser(data.user)
      toast.success(data.message || (isLogin ? "Login successful" : "Account created successfully"))
      
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      isLogin={isLogin}
      onToggleMode={() => {
        setIsLogin(!isLogin)
      }}
      onSubmit={handleSubmit}
    />
  )
}

