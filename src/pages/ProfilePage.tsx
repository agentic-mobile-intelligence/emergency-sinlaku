import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { formatDuration } from "@/lib/analytics"
import {
  LogOut, Edit2, Trash2, MapPin, ChevronRight, Check, X, Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Profile } from "@/types"
import { ACTIVITY_TYPES } from "@/types"
import { usePersonalRecords } from "@/hooks/usePersonalRecords"
import { useWeeklyGoal } from "@/hooks/useWeeklyGoal"
import { useAchievements } from "@/hooks/useAchievements"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProfilePageProps {
  profile: Profile | null
  onSignOut: () => void
  onUpdateProfile: (updates: Partial<Pick<Profile, "display_name" | "avatar_url">>) => Promise<unknown>
}

export default function ProfilePage({ profile, onSignOut, onUpdateProfile }: ProfilePageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState("")
  const { data: personalRecords } = usePersonalRecords(profile?.id)
  const { data: weeklyGoal, updateGoal } = useWeeklyGoal(profile?.id)
  const { data: achievements } = useAchievements(profile?.id)

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, name, status, distance_km, duration_ms, elevation_gain_m, started_at, ended_at, activity_type")
        .eq("status", "completed")
        .order("ended_at", { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const handleSaveName = async () => {
    if (!newName.trim()) return
    try {
      await onUpdateProfile({ display_name: newName.trim() })
      setEditing(false)
      toast.success("Name updated")
    } catch {
      toast.error("Failed to update name")
    }
  }

  const handleDelete = async () => {
    if (!deleteSessionId) return
    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", deleteSessionId)
    if (error) {
      toast.error("Failed to delete activity")
    } else {
      toast.success("Activity deleted")
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] })
    }
    setDeleteSessionId(null)
  }

  const totalDistance = sessions?.reduce((sum, s) => sum + (s.distance_km ?? 0), 0) ?? 0
  const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_ms ?? 0), 0) ?? 0
  const totalActivities = sessions?.length ?? 0

  return (
    <div className="flex-1 flex flex-col min-h-0 px-4 pt-2">
      {/* Profile header */}
      <div className="shrink-0 pb-4 border-b border-[#111]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] font-extrabold text-lg">
            {profile?.display_name
              ?.split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2) ?? "??"}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 bg-[#0a0a0a] border-[#222] text-white text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                />
                <button onClick={handleSaveName} className="text-[#FF6B35]">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditing(false)} className="text-[#555]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  {profile?.display_name ?? "Loading..."}
                </span>
                <button
                  onClick={() => {
                    setNewName(profile?.display_name ?? "")
                    setEditing(true)
                  }}
                  className="text-[#333] hover:text-[#FF6B35] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="text-[10px] text-[#444] uppercase tracking-widest mt-0.5">
              Member since{" "}
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "..."}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSignOut}
            className="text-[#333] hover:text-red-400 hover:bg-red-900/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-[#0a0a0a] p-3 text-center">
            <div className="text-lg font-extrabold">{totalDistance.toFixed(1)}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-widest">km total</div>
          </div>
          <div className="bg-[#0a0a0a] p-3 text-center">
            <div className="text-lg font-extrabold">{formatDuration(totalDuration)}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-widest">time total</div>
          </div>
          <div className="bg-[#0a0a0a] p-3 text-center">
            <div className="text-lg font-extrabold">{totalActivities}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-widest">activities</div>
          </div>
        </div>
      </div>

      {/* Weekly Goal */}
      {weeklyGoal && (
        <div className="shrink-0 py-4 border-b border-[#111]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-[#444] uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3 h-3" />
              Weekly Goal
            </div>
            <button
              onClick={() => {
                setGoalInput(String(weeklyGoal.goalKm))
                setEditingGoal(!editingGoal)
              }}
              className="text-[10px] text-[#555] hover:text-[#FF6B35] transition-colors"
            >
              {editingGoal ? "Cancel" : "Edit"}
            </button>
          </div>

          {editingGoal ? (
            <div className="flex gap-2 mb-2">
              <Input
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="h-8 text-sm bg-[#0a0a0a] border-[#222] text-white w-24"
                autoFocus
              />
              <span className="text-xs text-[#555] self-center">km / week</span>
              <Button
                size="sm"
                className="h-8 bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-xs"
                onClick={() => {
                  const val = parseFloat(goalInput)
                  if (val > 0) {
                    updateGoal.mutate(val)
                    setEditingGoal(false)
                    toast.success("Goal updated")
                  }
                }}
              >
                Save
              </Button>
            </div>
          ) : null}

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-extrabold">
              {weeklyGoal.progressKm.toFixed(1)}
            </span>
            <span className="text-sm text-[#555]">/ {weeklyGoal.goalKm} km</span>
          </div>

          <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, weeklyGoal.percentage)}%`,
                backgroundColor: weeklyGoal.percentage >= 100 ? "#22c55e" : "#FF6B35",
              }}
            />
          </div>

          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-[#444]">
              {Math.round(weeklyGoal.percentage)}%
            </span>
            <span className="text-[9px] text-[#444]">
              {weeklyGoal.daysLeft} day{weeklyGoal.daysLeft !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="shrink-0 py-4 border-b border-[#111]">
          <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">
            Achievements — {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  "flex flex-col items-center py-2.5 px-1 text-center transition-colors",
                  ach.unlocked ? "bg-[#0a0a0a]" : "bg-[#0a0a0a] opacity-35"
                )}
              >
                <span className="text-lg mb-0.5">{ach.unlocked ? ach.icon : "🔒"}</span>
                <span className="text-[8px] font-semibold text-[#888] leading-tight">
                  {ach.title}
                </span>
                {ach.unlocked && ach.unlockedDate && (
                  <span className="text-[7px] text-[#444] mt-0.5">{ach.unlockedDate}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Records */}
      {personalRecords && personalRecords.length > 0 && (
        <div className="shrink-0 py-4 border-b border-[#111]">
          <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">
            Personal Records
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {personalRecords.map((pr) => (
              <div
                key={pr.label}
                className="bg-[#0a0a0a] px-3 py-2.5 min-w-[100px] shrink-0"
              >
                <div className="text-sm mb-0.5">{pr.icon}</div>
                <div className="text-sm font-extrabold">{pr.value}</div>
                <div className="text-[9px] text-[#444] uppercase tracking-wider mt-0.5">
                  {pr.label}
                </div>
                {pr.date && (
                  <div className="text-[9px] text-[#333] mt-0.5">{pr.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity history */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-1 pb-2">
        <div className="text-[10px] text-[#444] uppercase tracking-widest mb-2">
          Activity History
        </div>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-[#111]" />
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 bg-[#0a0a0a] px-3 py-3 group"
            >
              <div className="w-9 h-9 bg-[#111] flex items-center justify-center text-sm">
                {ACTIVITY_TYPES.find((a) => a.value === session.activity_type)?.icon ?? (
                  <MapPin className="w-4 h-4 text-[#FF6B35]" />
                )}
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/summary/${session.id}`)}
              >
                <div className="text-sm font-semibold truncate">
                  {session.name ?? "Activity"}
                </div>
                <div className="text-[10px] text-[#555]">
                  {(session.distance_km ?? 0).toFixed(2)} km &middot;{" "}
                  {formatDuration(session.duration_ms ?? 0)} &middot;{" "}
                  {session.ended_at
                    ? new Date(session.ended_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </div>
              </div>
              <button
                onClick={() => setDeleteSessionId(session.id)}
                className="text-[#222] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate(`/summary/${session.id}`)}
                className="text-[#222] hover:text-[#888] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-6 h-6 text-[#222] mx-auto mb-2" />
            <p className="text-[#444] text-xs uppercase tracking-widest">
              No activities yet
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent className="bg-[#111] border-[#222] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#888]">
              This will permanently delete this activity and all its GPS data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#1a1a1a] border-[#222] text-white hover:bg-[#222] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
