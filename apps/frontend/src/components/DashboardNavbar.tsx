"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/src/stores/authStore"
import { authApi } from "@/src/lib/api"
import { toast } from "sonner"

export function DashboardNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout: logoutStore } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
      logoutStore()
      router.push("/auth")
      toast.success("Logged out successfully")
    } catch (err) {
      console.error("Logout error:", err)
      toast.error("Failed to logout")
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/stores", label: "$1000" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/settings", label: "Settings" },
  ]

  return (
    <nav className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-lg shadow-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand - Store Code */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">
              {user?.stores && user.stores.length > 0 && user.stores[0].store?.code
                ? user.stores[0].store.code
                : "i1020"}
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => router.push(item.href)}
                  className="h-10 px-4"
                >
                  {item.label}
                </Button>
              )
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div 
                className="text-sm text-muted-foreground hidden sm:block cursor-pointer hover:text-foreground transition-colors"
                onClick={() => router.push(`/dashboard/user/${user.id}`)}
              >
                {user.email}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

