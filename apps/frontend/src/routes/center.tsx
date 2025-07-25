import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

import calendar from '@/assets/images/calendar.png'
import cross from '@/assets/images/cross.png'
import health from '@/assets/images/health.png'
import logoutIcon from '@/assets/images/logout.png'
import people from '@/assets/images/people.png'
import screening from '@/assets/images/screening.png'
import whiteLogo from '@/assets/images/logo.svg'
import treatment from '@/assets/images/treatment.png'
import {
  isAuthMiddleware,
  useAuthUser,
  useLogout,
} from '@/services/providers/auth.provider'

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

  const authUserQuery = useQuery(useAuthUser())
  const user = authUserQuery.data?.data?.user
  const isStaff = user?.profile === 'CENTER_STAFF'
  const isAdmin = user?.profile === 'CENTER'

  const baseNavLinks = [
    { to: '/center', label: 'Dashboard', icon: cross },
    {
      to: '/center/appointments',
      label: 'Appointments',
      icon: calendar,
    },
    { to: '/center/verify-code', label: 'Verify Code', icon: screening },
    {
      to: '/center/upload-results',
      label: 'Upload Results',
      icon: treatment,
    },
  ]

  const adminNavLinks = [
    { to: '/center/receipt-history', label: 'Payouts', icon: health },
    { to: '/center/staff', label: 'Staff', icon: people },
  ]

  const navLinks = isAdmin ? [...baseNavLinks, ...adminNavLinks] : baseNavLinks

  return (
    <div className="min-h-screen w-full">
      {/* Fixed Sidebar for Desktop */}
      <div className="fixed inset-y-0 left-0 z-50 w-60 xl:w-72 hidden md:block bg-primary">
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center px-4 lg:h-[80px] lg:px-6">
            <Link
              to="/center"
              className="flex items-center gap-2 font-semibold"
            >
              <img src={whiteLogo} alt="ZeroCancer" className="h-12" />
              {isStaff && (
                <span className="text-sm text-gray-300 ml-2">
                  Staff Portal
                </span>
              )}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  preload="render"
                  className="flex items-center gap-4 rounded-lg px-3 py-3 text-white transition-all hover:bg-white/20"
                  activeOptions={{ exact: true }}
                  activeProps={{ className: 'bg-white/30 font-semibold' }}
                >
                  <img src={link.icon} alt={link.label} className="h-6 w-6" />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="p-2 lg:p-4 mt-auto">
              <button
                onClick={() => logout()}
                className="cursor-pointer flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm font-medium text-white transition-all hover:bg-white/20"
              >
                <img src={logoutIcon} alt="Logout" className="h-6 w-6" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="flex flex-col md:ml-60 xl:ml-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-primary px-4 py-6 shadow-md md:hidden">
          <Link to="/center" className="flex items-center gap-2 font-semibold">
            <img src={whiteLogo} alt="ZeroCancer" className="h-12" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => logout()}
              className="cursor-pointer rounded-full p-2 text-white transition-all hover:bg-white/20"
              aria-label="Logout"
            >
              <img src={logoutIcon} alt="logout" className="h-6 w-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow bg-neutral-50 p-4 pb-24 md:p-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-2 inset-x-2 md:hidden bg-white z-50 shadow-lg rounded-xl">
        <nav className="flex justify-around items-center h-16 px-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex-1"
              activeOptions={{
                exact: link.to === '/center' ? true : false,
              }}
              preload="render"
            >
              {({ isActive }) => (
                <div
                  className={`flex h-16 w-full flex-col items-center justify-center rounded-lg p-1 transition-colors duration-200 ${
                    isActive ? 'bg-primary' : 'bg-transparent'
                  }`}
                >
                  <img src={link.icon} alt={link.label} className="h-6 w-6" />
                  <span
                    className={`mt-2 text-xs ${
                      isActive
                        ? 'font-semibold text-white'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {link.label.split(' ')[0]}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
