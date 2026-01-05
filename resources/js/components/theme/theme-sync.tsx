import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { useTheme } from '@/features/theme/theme-provider'
import { type PageProps } from '@/types'
import { type Theme } from '@/features/theme/theme-provider'

/**
 * Component that syncs user theme from database to ThemeProvider
 * Must be used inside Inertia page context
 */
export const ThemeSync = () => {
  const { user } = usePage<PageProps>().props
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      setTheme(user.theme as Theme)
    }
  }, [user?.theme, theme, setTheme])

  return null
}
