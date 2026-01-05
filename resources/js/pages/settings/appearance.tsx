import { PageLayout } from '@/components/layout/page-layout'
import { SettingsLayout } from '@/components/layout/settings-layout'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { THEME_UPDATE_API } from '@/lib/constants'
import { useTheme, type Theme as ThemeType, Themes } from '@/features/theme/theme-provider'
import { useIsMobile } from '@/hooks/use-mobile'
import { type BreadcrumbItem, type PageProps } from '@/types'
import { usePage, useForm } from '@inertiajs/react'
import { MoonIcon, PaletteIcon, SparklesIcon, SunIcon } from 'lucide-react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Appearance settings',
    href: '/settings/appearance',
    id: 1,
  },
]

type ThemeForm = {
  theme: 'dark' | 'light' | 'system' | 'iron-man'
}

const AppearancePage = () => {
  const { theme, setTheme } = useTheme()
  const { user } = usePage<PageProps>().props
  const isMobile = useIsMobile()

  const { put, processing } = useForm<ThemeForm>({
    theme: (user?.theme as 'dark' | 'light' | 'system' | 'iron-man') || 'system',
  })

  const handleThemeChange = (value: string) => {
    const newTheme = value as ThemeType
    setTheme(newTheme) // Обновляем локальное состояние сразу

    // Определяем сообщение в зависимости от темы
    const themeMessages: Record<ThemeType, string> = {
      'light': 'Light theme selected',
      'dark': 'Dark theme selected',
      'system': 'System theme selected',
      'iron-man': 'Iron Man is on',
    }

    // Сохраняем в БД
    put(THEME_UPDATE_API, {
      data: { theme: newTheme },
      preserveScroll: true,
      onSuccess: () => {
        toast.success(themeMessages[newTheme])
      },
      onError: () => {
        toast.error('Failed to update theme')
      },
    })
  }

  return (
    <PageLayout breadcrumbs={breadcrumbs} pageTitle="Appearance settings">
      <SettingsLayout>
        <section className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <PaletteIcon className="h-4 w-4" />
                Theme Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme appearance.
              </p>
            </div>
            <div className="md:col-span-2">
              <RadioGroup
                value={theme}
                className="grid grid-cols-3 gap-4"
                onValueChange={handleThemeChange}
                disabled={processing}
              >
                <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value={Themes.light} id={Themes.light} />
                  <Label
                    htmlFor={Themes.light}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    {!isMobile && <SunIcon className="h-4 w-4" />}
                    Light
                  </Label>
                </div>
                <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value={Themes.dark} id={Themes.dark} />
                  <Label
                    htmlFor={Themes.dark}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    {!isMobile && <MoonIcon className="h-4 w-4" />}
                    Dark
                  </Label>
                </div>
                <div className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value={Themes['iron-man']} id={Themes['iron-man']} />
                  <Label
                    htmlFor={Themes['iron-man']}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    {!isMobile && <SparklesIcon className="h-4 w-4" />}
                    Iron Man
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />
        </section>
      </SettingsLayout>
    </PageLayout>
  )
}

export default AppearancePage
