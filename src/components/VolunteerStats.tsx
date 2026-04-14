import { useState, useEffect } from "react"
import { Users, MapPin, Wrench } from "lucide-react"
import { supabase } from "@/lib/supabase"

const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}

const SKILL_LABELS: Record<string, string> = {
  cleanup: "Cleanup", food_distribution: "Food Dist.", shelter_management: "Shelter Mgmt",
  transportation: "Transport", medical_support: "Medical", emotional_support: "Emotional",
  childcare: "Childcare", translation: "Translation", general_labor: "General Labor", other: "Other",
}

type Stats = {
  totalVolunteers: number
  totalLeaders: number
  byIsland: Record<string, number>
  topSkills: { skill: string; count: number }[]
}

export default function VolunteerStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from("volunteer_signups").select("island, skills"),
      supabase.from("volunteer_leader_signups").select("island, skills"),
    ]).then(([signups, leaders]) => {
      const allSignups = signups.data ?? []
      const allLeaders = leaders.data ?? []

      const byIsland: Record<string, number> = {}
      const skillCounts: Record<string, number> = {}

      for (const row of [...allSignups, ...allLeaders]) {
        const island = (row as any).island
        if (island) byIsland[island] = (byIsland[island] ?? 0) + 1
        const skills = (row as any).skills as string[] | null
        if (skills) {
          for (const s of skills) skillCounts[s] = (skillCounts[s] ?? 0) + 1
        }
      }

      const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }))

      setStats({
        totalVolunteers: allSignups.length,
        totalLeaders: allLeaders.length,
        byIsland,
        topSkills,
      })
    })
  }, [])

  if (!stats) return null

  const total = stats.totalVolunteers + stats.totalLeaders
  if (total === 0) return null

  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-[#1E3A5F]" />
        <p className="text-sm font-semibold text-[#1E3A5F]">Volunteer Response</p>
      </div>

      {/* Totals */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-center">
          <p className="text-2xl font-bold text-[#1E3A5F]">{total}</p>
          <p className="text-xs text-gray-500">Total Volunteers</p>
        </div>
        {stats.totalLeaders > 0 && (
          <div className="flex-1 rounded-lg bg-white border border-gray-200 px-3 py-2 text-center">
            <p className="text-2xl font-bold text-[#1E3A5F]">{stats.totalLeaders}</p>
            <p className="text-xs text-gray-500">Team Leaders</p>
          </div>
        )}
      </div>

      {/* By island */}
      {Object.keys(stats.byIsland).length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> By Island
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(stats.byIsland)
              .sort((a, b) => b[1] - a[1])
              .map(([island, count]) => (
                <span key={island} className="rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs">
                  <span className="font-medium text-[#1E3A5F]">{ISLAND_LABELS[island] ?? island}</span>
                  <span className="text-gray-400 ml-1">{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Top skills */}
      {stats.topSkills.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
            <Wrench className="w-3 h-3" /> Skills Available
          </p>
          <div className="flex gap-2 flex-wrap">
            {stats.topSkills.map(({ skill, count }) => (
              <span key={skill} className="rounded-full bg-[#1E3A5F]/10 px-2.5 py-1 text-xs">
                <span className="font-medium text-[#1E3A5F]">{SKILL_LABELS[skill] ?? skill}</span>
                <span className="text-[#1E3A5F]/50 ml-1">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
