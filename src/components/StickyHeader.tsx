import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, Plus, ClipboardList, Building2, Star } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserRole } from "@/contexts/UserRoleContext"

export default function StickyHeader() {
  const location = useLocation()
  const navigate = useNavigate()
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
          <SignedOut>
            <Link
              to="/request-aid"
              className="bg-[#DC2626] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-red-700 transition"
            >
              Request Aid
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
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className="bg-[#1E3A5F] border border-white/40 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#2a4f7a] transition hidden sm:block"
                >
                  Admin
                </Link>

                {/* Quick-add dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 transition text-white"
                      title="Quick add"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Add</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin?tab=volunteers&action=new-sheet")}>
                      <ClipboardList className="w-4 h-4 mr-2" />
                      New Volunteer Sheet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/provider/register")}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Add Organization
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin?tab=organizations")}>
                      <Star className="w-4 h-4 mr-2" />
                      Highlight an Org
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
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
