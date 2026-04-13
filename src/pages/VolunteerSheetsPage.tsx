import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Users, Calendar, MapPin, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

const SKILL_LABELS: Record<string, string> = {
  cleanup: "Cleanup",
  food_distribution: "Food Distribution",
  shelter_management: "Shelter Management",
  transportation: "Transportation",
  medical_support: "Medical Support",
  emotional_support: "Emotional Support",
  childcare: "Childcare",
  translation: "Translation",
  general_labor: "General Labor",
  other: "Other",
}

const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam",
  saipan: "Saipan",
  tinian: "Tinian",
  rota: "Rota",
}

type Sheet = {
  id: string
  title: string
  organization_name: string
  description: string | null
  island: string
  skills_needed: string[]
  date_text: string | null
  capacity: number | null
  signup_count: number
  contact_info: string | null
  status: string
}

export default function VolunteerSheetsPage() {
  const navigate = useNavigate()
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("volunteer_sheets")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError("Could not load volunteer sheets.")
        else setSheets(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Volunteer Sign-Up Sheets</h1>
          <p className="text-gray-500 text-sm">
            Choose an opportunity below and sign up. No account required.
          </p>
        </div>

        {/* General volunteer CTA */}
        <div className="rounded-xl border-2 border-[#1E3A5F] bg-[#1E3A5F]/5 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#1E3A5F]">Not sure where to help?</p>
            <p className="text-sm text-gray-600 mt-0.5">Submit a general volunteer sign-up and we'll match you.</p>
          </div>
          <Link to="/volunteer">
            <Button size="sm" className="bg-[#1E3A5F] text-white whitespace-nowrap">
              Sign Up <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Sheets list */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading sheets…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && sheets.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No active volunteer sheets at this time.
          </div>
        )}

        {!loading && !error && sheets.length > 0 && (
          <div className="space-y-4">
            {sheets.map((sheet) => {
              const spotsLeft = sheet.capacity !== null
                ? Math.max(0, sheet.capacity - sheet.signup_count)
                : null
              const full = spotsLeft === 0

              return (
                <div
                  key={sheet.id}
                  className={`rounded-xl border ${full ? "border-gray-200 opacity-60" : "border-gray-200 hover:border-[#1E3A5F]/40 hover:shadow-sm"} bg-white transition p-5 space-y-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h2 className="font-semibold text-[#1E3A5F] text-base leading-snug">
                        {sheet.title}
                      </h2>
                      <p className="text-xs text-gray-500">{sheet.organization_name}</p>
                    </div>
                    {full && (
                      <Badge variant="secondary" className="shrink-0 text-xs">Full</Badge>
                    )}
                  </div>

                  {sheet.description && (
                    <p className="text-sm text-gray-600">{sheet.description}</p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {ISLAND_LABELS[sheet.island] ?? sheet.island}
                    </span>
                    {sheet.date_text && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {sheet.date_text}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {spotsLeft !== null
                        ? full ? "No spots left" : `${spotsLeft} of ${sheet.capacity} spots open`
                        : `${sheet.signup_count} signed up`}
                    </span>
                  </div>

                  {sheet.skills_needed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sheet.skills_needed.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs px-2.5 py-0.5 font-medium"
                        >
                          {SKILL_LABELS[s] ?? s}
                        </span>
                      ))}
                    </div>
                  )}

                  {!full && (
                    <Link to={`/volunteer?sheet=${sheet.id}`}>
                      <Button size="sm" className="w-full mt-1 bg-[#1E3A5F] text-white">
                        Sign Up for This <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pt-2">
          <Link to="/" className="underline">Back to directory</Link>
        </p>
      </div>
    </div>
  )
}
