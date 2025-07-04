import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import {
  Briefcase,
  ClipboardCheck,
  FileText,
  Home,
  LogOut,
  Upload,
  Users,
  Wallet,
} from 'lucide-react'

import logo from '@/assets/images/logo-blue.svg'
import {
  isAuthMiddleware,
  useAuthUser,
  useLogout,
} from '@/services/providers/auth.provider'
import { useNavigate } from '@tanstack/react-router'
import type { TAuthMeResponse } from '@zerocancer/shared/types'

export const Route = createFileRoute('/center')({
  component: CenterLayout,
  beforeLoad: async ({ context }) => {
    const { isAuth, profile } = await isAuthMiddleware(context.queryClient)

    if (!isAuth) return redirect({ to: `/` })

    // Check if user is CENTER or CENTER_STAFF
    const isCenterUser = profile === 'CENTER' || profile === 'CENTER_STAFF'

    // If authenticated but wrong role, redirect to correct dashboard
    if (!isCenterUser) {
      if (profile === 'PATIENT') return redirect({ to: '/patient' })
      if (profile === 'DONOR') return redirect({ to: '/donor' })
      if (profile === 'ADMIN') return redirect({ to: '/admin' })

      // If unknown profile, redirect to home
      return redirect({ to: '/' })
    }

    return null
  },
})

function CenterLayout() {
  const { mutate: logout } = useLogout()
  const navigate = useNavigate()

  // Get current user to determine role-based navigation
  const authUserQuery = useQuery(useAuthUser())
  const user = authUserQuery.data?.data?.user
  const isStaff = user?.profile === 'CENTER_STAFF'
  const isAdmin = user?.profile === 'CENTER'

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-60 lg:w-72 hidden md:block border-r bg-muted/40">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[70px] lg:px-6">
            <Link
              to="/center"
              className="flex items-center gap-2 font-semibold"
            >
              <img src={logo} alt="ZeroCancer" className="h-12" />
              {isStaff && (
                <span className="text-sm text-muted-foreground ml-2">
                  Staff Portal
                </span>
              )}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-2">
              <Link
                to="/center"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                activeOptions={{ exact: true }}
                activeProps={{ className: 'bg-muted text-primary' }}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/center/appointments"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                activeProps={{ className: 'bg-muted text-primary' }}
              >
                <Briefcase className="h-4 w-4" />
                Appointments
              </Link>
              <Link
                to="/center/verify-code"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                activeProps={{ className: 'bg-muted text-primary' }}
              >
                <ClipboardCheck className="h-4 w-4" />
                Verify Code
              </Link>
              <Link
                to="/center/upload-results"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                activeProps={{ className: 'bg-muted text-primary' }}
              >
                <Upload className="h-4 w-4" />
                Upload Results
              </Link>
              {/* <Link
                to="/center/results-history"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                activeProps={{ className: 'bg-muted text-primary' }}
              >
                <FileText className="h-4 w-4" />
                Results History
              </Link> */}
              {/* Admin-only features */}
              {isAdmin && (
                <>
                  <Link
                    to="/center/receipt-history"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    activeProps={{ className: 'bg-muted text-primary' }}
                  >
                    <Wallet className="h-4 w-4" />
                    Payouts
                  </Link>
                  <Link
                    to="/center/staff"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    activeProps={{ className: 'bg-muted text-primary' }}
                  >
                    <Users className="h-4 w-4" />
                    Staff
                  </Link>
                </>
              )}
              <div className="border-t p-2 lg:p-4">
                <button
                  onClick={() => {
                    logout()
                    navigate({ to: '/', replace: true, reloadDocument: true })
                  }}
                  className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-60 lg:ml-72">
        <main className="flex flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
