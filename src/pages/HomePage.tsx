import { useNavigate } from "react-router-dom"
import { Phone, ChevronDown, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"

// supabase is imported for future data fetching (service counts, status)
void supabase

const BRAND = "#1E3A5F"

const islands = [
  { slug: "guam",    name: "Guam",    description: "Hagåtña & surrounding villages" },
  { slug: "saipan",  name: "Saipan",  description: "Capital & northern villages" },
  { slug: "tinian",  name: "Tinian",  description: "San Jose & surrounding areas" },
  { slug: "rota",    name: "Rota",    description: "Songsong & surrounding areas" },
] as const

const emergencyContacts = [
  { label: "Emergency",     display: "911",            tel: "911" },
  { label: "Non-Emergency", display: "311",            tel: "311" },
  { label: "FEMA",          display: "1-800-621-3362", tel: "18006213362" },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Emergency Hotline Banner ── persistent, not dismissible ── */}
      <div className="bg-red-700 text-white text-sm py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
          <span className="font-bold tracking-wide">🆘 EMERGENCY:</span>
          {emergencyContacts.map((c) => (
            <a
              key={c.tel}
              href={`tel:${c.tel}`}
              className="hover:underline font-semibold whitespace-nowrap"
            >
              {c.label}: <span className="font-mono">{c.display}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-sm border-b border-blue-900/20 px-4 py-3"
        style={{ backgroundColor: BRAND }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">

          {/* Left: Home + island selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-white font-semibold hover:text-blue-200 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Home</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 hover:text-white gap-1 text-sm"
                >
                  Islands
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                {islands.map((island) => (
                  <DropdownMenuItem
                    key={island.slug}
                    onClick={() => navigate(`/${island.slug}`)}
                    className="cursor-pointer"
                  >
                    {island.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: sign-up CTAs */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white min-h-[36px]"
              onClick={() => navigate("/request-aid")}
            >
              <span className="hidden xs:inline">Sign up</span>
              <span className="xs:hidden">Aid</span>
              <span className="hidden sm:inline"> (Recipient)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white min-h-[36px]"
              onClick={() => navigate("/provider/register")}
            >
              <span className="hidden xs:inline">Sign up</span>
              <span className="xs:hidden">Provider</span>
              <span className="hidden sm:inline"> (Service Provider)</span>
            </Button>
          </div>

        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center px-4 py-14">
        <div className="max-w-2xl w-full space-y-10">

          {/* Hero */}
          <div className="text-center space-y-4">
            <h1
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: BRAND }}
            >
              Mariana Islands Emergency Relief Directory
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Find emergency services, support, and relief resources for communities
              affected by Supertyphoon Sinlaku.
            </p>
          </div>

          {/* Island Buttons */}
          <div className="space-y-4">
            <p className="text-center text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Select your island
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {islands.map((island) => (
                <button
                  key={island.slug}
                  onClick={() => navigate(`/${island.slug}`)}
                  className="group rounded-xl border-2 border-gray-200 bg-white p-6 text-center
                    transition-all hover:border-[#1E3A5F] hover:bg-blue-50
                    focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:ring-offset-2
                    min-h-[88px] cursor-pointer"
                >
                  <div
                    className="text-xl font-bold text-gray-900 group-hover:text-[#1E3A5F]
                      transition-colors"
                  >
                    {island.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">
                    {island.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Phone className="h-4 w-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Emergency Contacts
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.tel}
                  href={`tel:${contact.tel}`}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white
                    px-5 py-3 text-sm hover:bg-blue-50 hover:border-[#1E3A5F]
                    transition-colors min-h-[48px]"
                >
                  <span className="text-gray-500">{contact.label}:</span>
                  <span className="font-mono font-bold" style={{ color: BRAND }}>
                    {contact.display}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 px-4 py-6 text-center">
        <p className="text-sm text-gray-500">
          Built by Guahan.TECH for the Mariana Islands
        </p>
      </footer>

    </div>
  )
}
