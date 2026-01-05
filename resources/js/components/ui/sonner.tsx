import { useTheme } from '@/features/theme/theme-provider'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  // Преобразуем тему в формат sonner (dark/light)
  const sonnerTheme =
    theme === 'dark' || theme === 'iron-man' ? 'dark' : theme === 'light' ? 'light' : 'system'

  return (
    <Sonner
      theme={sonnerTheme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
