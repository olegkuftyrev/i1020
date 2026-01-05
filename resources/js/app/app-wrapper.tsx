import React from 'react'
import { AppProvider } from '@/app/provider'
import { ThemeProvider } from '@/features/theme/theme-provider'
import { IronManGrid } from '@/components/theme/iron-man-grid'
import { Toaster } from '@/components/ui/sonner'

interface AppWrapperProps {
  children: React.ReactNode
}

export const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  return (
    <AppProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <IronManGrid />
        {children}
        <Toaster />
      </ThemeProvider>
    </AppProvider>
  )
}
