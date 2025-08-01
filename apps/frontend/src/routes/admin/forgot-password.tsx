import { createFileRoute, useNavigate, Link, redirect } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminForgotPasswordSchema } from '@zerocancer/shared/schemas/admin.schema'
import type { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAdminForgotPassword } from '@/services/providers/admin.provider'
import { isAuthMiddleware } from '@/services/providers/auth.provider'
import logo from '@/assets/images/logo-blue.svg'

type AdminForgotPasswordForm = z.infer<typeof adminForgotPasswordSchema>

export const Route = createFileRoute('/admin/forgot-password')({
  component: AdminForgotPasswordPage,
  beforeLoad: async ({ context }) => {
    const { isAuth, profile } = await isAuthMiddleware(context.queryClient)
    
    // If already authenticated as admin, redirect to admin dashboard
    if (isAuth && profile === 'ADMIN') {
      return redirect({ to: '/admin' })
    }
    
    return null
  },
})

function AdminForgotPasswordPage() {
  const navigate = useNavigate()
  const [emailSent, setEmailSent] = useState(false)
  const adminForgotPasswordMutation = useAdminForgotPassword()

  const form = useForm<AdminForgotPasswordForm>({
    resolver: zodResolver(adminForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: AdminForgotPasswordForm) => {
    try {
      const response = await adminForgotPasswordMutation.mutateAsync(data)
      
      if (response.ok) {
        setEmailSent(true)
        toast.success('Password reset email sent! Check your inbox.')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to send reset email. Please try again.'
      toast.error(errorMessage)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img src={logo} alt="ZeroCancer" className="h-16" />
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Didn't receive email? Try again
                </Button>
                
                <Link to="/admin/login">
                  <Button variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="ZeroCancer" className="h-16" />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your admin email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@zerocancer.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={adminForgotPasswordMutation.isPending}
                >
                  {adminForgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center">
              <Link
                to="/admin/login"
                className="text-sm text-primary hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 