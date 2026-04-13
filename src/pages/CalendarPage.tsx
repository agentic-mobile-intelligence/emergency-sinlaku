import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Tables, Constants } from "@/lib/database.types"
import { cn } from "@/lib/utils"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"

type Offering = Tables<"offerings">

const ISLAND_COLORS: Record<string, { bg: string; text: string }> = {
  guam:     { bg: "bg-blue-600",   text: "text-white" },
  saipan:   { bg: "bg-emerald-600", text: "text-white" },
  tinian:   { bg: "bg-amber-500",  text: "text-white" },
  rota:     { bg: "bg-purple-600", text: "text-white" },
}

const SERVICE_LABELS: Record<string, string> = {
  shelter:        "Shelter",
  food:           "Food",
  water:          "Water",
  medical:        "Medical",
  tarps:          "Tarps",
  cleanup:        "Cleanup",
  clothing:       "Clothing",
  transportation: "Transport",
}

// April 2026: April 1 is a Wednesday.
// Weeks run Sun–Sat; first week starts March 29.
function getAprilWeeks(): Date[][] {
  const weeks: Date[][] = []
  const origin = new Date(2026, 2, 29) // March 29, 2026 (month is 0-indexed)
  for (let w = 0; w < 5; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(origin)
      date.setDate(origin.getDate() + w * 7 + d)
      week.push(date)
    }
    weeks.push(week)
  }
  return weeks
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function normalizeDate(iso: string | null): string | null {
  return iso ? iso.slice(0, 10) : null
}

function offeringOccursOnDay(offering: Offering, day: Date): boolean {
  const dayStr = toDateStr(day)
  const start = normalizeDate(offering.planned_start)
  const end = normalizeDate(offering.planned_end)
  if (!start) return false
  if (end) return start <= dayStr && dayStr <= end
  return start === dayStr
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ALL_SERVICE_TYPES = Constants.public.Enums.service_type
const ISLANDS = Constants.public.Enums.island

export default function CalendarPage() {
  const navigate = useNavigate()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(ALL_SERVICE_TYPES))

  const weeks = getAprilWeeks()
  const today = toDateStr(new Date())

  useEffect(() => {
    async function fetchOfferings() {
      const { data, error } = await supabase
        .from("offerings")
        .select("*")
        .not("planned_start", "is", null)
        .lte("planned_start", "2026-04-30")
        .or("planned_end.is.null,planned_end.gte.2026-04-01")
        .order("planned_start")

      if (!error && data) setOfferings(data)
      setLoading(false)
    }
    fetchOfferings()
  }, [])

  function toggleType(type: string) {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function toggleAll() {
    if (activeTypes.size === ALL_SERVICE_TYPES.length) {
      setActiveTypes(new Set())
    } else {
      setActiveTypes(new Set(ALL_SERVICE_TYPES))
    }
  }

  const filtered = offerings.filter(o => activeTypes.has(o.service_type))

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-destructive text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <CalendarDays className="h-5 w-5" />
        <h1 className="text-lg font-bold tracking-tight">April 2026 — Aid Calendar</h1>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {/* Controls row */}
        <div className="flex flex-wrap gap-6 items-start">
          {/* Island legend */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Islands
            </p>
            <div className="flex flex-wrap gap-2">
              {ISLANDS.map(island => {
                const c = ISLAND_COLORS[island] ?? { bg: "bg-gray-500", text: "text-white" }
                return (
                  <span
                    key={island}
                    className={cn(
                      "px-2.5 py-0.5 rounded text-xs font-semibold",
                      c.bg, c.text,
                    )}
                  >
                    {island.charAt(0).toUpperCase() + island.slice(1)}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Service type filters */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Filter by Service
              </p>
              <button
                onClick={toggleAll}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {activeTypes.size === ALL_SERVICE_TYPES.length ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {ALL_SERVICE_TYPES.map(type => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={activeTypes.has(type)}
                    onChange={() => toggleType(type)}
                    className="rounded"
                  />
                  <span className="text-xs">{SERVICE_LABELS[type] ?? type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="text-center text-muted-foreground py-20">
            Loading offerings…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-px mb-1">
                {DAY_NAMES.map(name => (
                  <div
                    key={name}
                    className="text-center text-xs font-semibold text-muted-foreground py-1"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Week rows */}
              <div className="space-y-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1">
                    {week.map((day, di) => {
                      const inApril = day.getMonth() === 3
                      const dayStr = toDateStr(day)
                      const isToday = dayStr === today
                      const dayOfferings = filtered.filter(o => offeringOccursOnDay(o, day))

                      return (
                        <div
                          key={di}
                          className={cn(
                            "min-h-[110px] p-1.5 rounded border",
                            inApril
                              ? "bg-card border-border"
                              : "bg-muted/20 border-transparent",
                          )}
                        >
                          {/* Day number */}
                          <div className="mb-1">
                            <span
                              className={cn(
                                "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                                isToday && "bg-destructive text-white",
                                !isToday && inApril && "text-foreground",
                                !isToday && !inApril && "text-muted-foreground/40",
                              )}
                            >
                              {day.getDate()}
                            </span>
                          </div>

                          {/* Offering entries */}
                          <div className="space-y-0.5">
                            {dayOfferings.map(offering => {
                              const c = ISLAND_COLORS[offering.island] ?? {
                                bg: "bg-gray-500",
                                text: "text-white",
                              }
                              return (
                                <button
                                  key={offering.id}
                                  onClick={() =>
                                    navigate(`/${offering.island}#${offering.id}`)
                                  }
                                  className={cn(
                                    "w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium",
                                    "truncate block leading-tight",
                                    "hover:opacity-75 active:opacity-60 transition-opacity",
                                    c.bg, c.text,
                                  )}
                                  title={`${offering.name} · ${offering.island} · ${offering.service_type}`}
                                >
                                  {offering.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && offerings.length > 0 && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No offerings match the selected filters.
          </p>
        )}
        {!loading && offerings.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No offerings with scheduled dates found for April 2026.
          </p>
        )}
      </div>
    </div>
  )
}
