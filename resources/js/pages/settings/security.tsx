import { PageLayout } from '@/components/layout/page-layout'
import { SettingsLayout } from '@/components/layout/settings-layout'
import { InputError } from '@/components/common/input-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PASSWORD_UPDATE_API } from '@/lib/constants'
import { type BreadcrumbItem, type PageProps, type ValidationErrors } from '@/types'
import { usePage, useForm } from '@inertiajs/react'
import { AlertTriangleIcon, KeyIcon, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Security settings',
    href: '/settings/security',
    id: 1,
  },
]

type PasswordForm = {
  password: string
  password_confirmation: string
}

const SecurityPage = () => {
  const { flash } = usePage<PageProps>().props
  const { errors } = (flash || {}) as { errors: ValidationErrors }

  const { data, setData, put, processing, reset } = useForm<PasswordForm>({
    password: '',
    password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const toastId = toast.loading('Updating password...')

    put(PASSWORD_UPDATE_API, {
      preserveScroll: true,
      onSuccess: () => {
        reset()
        toast.success('Password updated successfully!', { id: toastId })
      },
      onError: (errors) => {
        const errorMessages: string[] = []
        if (errors.password) errorMessages.push(`Password: ${errors.password}`)
        if (errors.password_confirmation)
          errorMessages.push(`Confirm password: ${errors.password_confirmation}`)

        const errorMessage =
          errorMessages.length > 0
            ? errorMessages.join(', ')
            : 'An error occurred while updating password'
        toast.error(errorMessage, { id: toastId })
      },
    })
  }

  return (
    <PageLayout breadcrumbs={breadcrumbs} pageTitle="Security settings">
      <SettingsLayout>
        <section className="w-full lg:w-3/4 space-y-8">
          {/* Change Password */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <KeyIcon className="h-4 w-4" />
                  Change Password
                </Label>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure.
                </p>
              </div>
              <div className="space-y-4 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs text-muted-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors?.password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    disabled={processing}
                  />
                  <InputError message={errors?.password_confirmation} />
                </div>
                <Alert>
                  <AlertTriangleIcon className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Make sure your password is at least 6 characters long and includes a mix of
                    letters, numbers, and symbols.
                  </AlertDescription>
                </Alert>
                <div>
                  <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <Separator />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Delete account</Label>
              <p className="text-sm text-muted-foreground">
                No longer want to use our service? You can delete your account here. This action is
                not reversible. All information related to this account will be deleted permanently.
              </p>
            </div>
            <div className="space-y-3 md:col-span-2">
              <Button variant="destructive" size="sm" className="px-6 h-12 rounded-full">
                Yes, delete my account
              </Button>
            </div>
          </div>
        </section>
      </SettingsLayout>
    </PageLayout>
  )
}

export default SecurityPage
