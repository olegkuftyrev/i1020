"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/src/stores/authStore"
import { authApi } from "@/src/lib/api"
import { AuthForm } from "@/src/components/AuthForm"

export function AuthView() {
  const router = useRouter()
  const { setUser, setLoading, setError } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [success, setSuccess] = useState("")

  const handleSubmit = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)
    setSuccess("")

    try {
      const data = isLogin
        ? await authApi.login({ email, password })
        : await authApi.register({ email, password, fullName })

      setUser(data.user)
      setSuccess(data.message || "Success!")
      
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      isLogin={isLogin}
      onToggleMode={() => {
        setIsLogin(!isLogin)
        setError(null)
        setSuccess("")
      }}
      onSubmit={handleSubmit}
      success={success}
    />
  )
}

