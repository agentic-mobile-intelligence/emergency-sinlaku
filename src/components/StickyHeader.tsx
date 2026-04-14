import { Link, useLocation } from "react-router-dom"
import { Home } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import { useUserRole } from "@/contexts/UserRoleContext"

export default function StickyHeader() {
  const location = useLocation()
  const isLanding = location.pathname === "/"
  const { isAdmin } = useUserRole()

  return (
    <header className="sticky top-0 z-40 bg-[#1E3A5F] text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        {/* Left: Home + title */}
        <div className="flex items-center gap-3">
          {!isLanding && (
            <Link to="/" className="hover:opacity-80 transition" title="Home">
              <Home className="w-5 h-5" />
            </Link>
          )}
          <Link to="/" className="font-bold text-sm tracking-wide hidden sm:block">
            Sinlaku Relief Directory
          </Link>
        </div>

        {/* Right: CTAs + auth */}
        <div className="flex items-center gap-2">
          {/* Provider sign-up always goes to /provider/register (org form follows auth) */}
          <SignedOut>
            <Link
              to="/request-aid"
              className="bg-[#DC2626] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-700 transition"
            >
              Sign up as Recipient
            </Link>
            <Link
              to="/provider/register"
              className="border border-white/50 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white/10 transition"
            >
              Sign up as Provider
            </Link>
            <SignInButton mode="modal">
              <button className="text-white/80 px-2 py-1.5 text-xs hover:text-white hover:underline transition hidden sm:block">
                Log in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {isAdmin && (
              <Link
                to="/admin"
                className="bg-destructive/80 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-destructive transition hidden sm:block"
              >
                Admin
              </Link>
            )}
            {!isAdmin && (
              <Link
                to="/provider/dashboard"
                className="border border-white/50 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white/10 transition hidden sm:block"
              >
                Dashboard
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
