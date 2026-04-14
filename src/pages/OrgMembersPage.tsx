import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft, Loader2, Users, Eye, EyeOff, Shield, Info,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

type Member = {
  id: string
  clerk_user_id: string
  display_name: string | null
  role: string
  share_publicly: boolean
  created_at: string
}

type OrgInfo = {
  id: string
  name: string
}

export default function OrgMembersPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { user, supabaseClient } = useAuth()

  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const userId = user?.id

  useEffect(() => {
    if (!orgId) return
    Promise.all([
      supabaseClient.from("organizations").select("id, name").eq("id", orgId).single(),
      supabaseClient.from("org_members").select("*").eq("organization_id", orgId).order("created_at"),
    ]).then(([orgRes, membersRes]) => {
      if (orgRes.data) setOrg(orgRes.data as OrgInfo)
      setMembers((membersRes.data as Member[]) ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  async function toggleVisibility(memberId: string, current: boolean) {
    setToggling(memberId)
    const { error } = await supabaseClient
      .from("org_members")
      .update({ share_publicly: !current })
      .eq("id", memberId)
    if (error) {
      toast.error("Failed to update: " + error.message)
    } else {
      setMembers((prev) =>
        prev.map((m) => m.id === memberId ? { ...m, share_publicly: !current } : m)
      )
      toast.success(!current ? "Your info is now visible to this organization" : "Your info is now hidden")
    }
    setToggling(null)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const me = members.find((m) => m.clerk_user_id === userId)

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/provider/dashboard" className="text-[#1E3A5F] hover:opacity-70 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Members</h1>
            {org && <p className="text-sm text-gray-500">{org.name}</p>}
          </div>
        </div>

        {/* Privacy Toolkit */}
        <Card className="border border-purple-200 bg-purple-50">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700" />
              <p className="text-sm font-semibold text-purple-800">Privacy Controls</p>
            </div>
            <p className="text-xs text-purple-700">
              Your information is <strong>private by default</strong>. When you toggle sharing ON,
              only other members of this organization can see your name. Your contact details,
              email, and other personal information are never shared — only your display name
              and membership role are visible.
            </p>
            <div className="flex items-center gap-4 text-xs text-purple-600 pt-1">
              <span className="flex items-center gap-1"><EyeOff className="w-3 h-3" /> Private = only you see your name</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Shared = org members see your name</span>
            </div>
          </CardContent>
        </Card>

        {/* My membership */}
        {me && (
          <Card className="border-2 border-[#1E3A5F]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-[#1E3A5F]">Your Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center text-sm font-bold text-[#1E3A5F]">
                    {(me.display_name ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{me.display_name ?? "You"}</p>
                    <Badge variant="outline" className="text-xs capitalize">{me.role}</Badge>
                  </div>
                </div>
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px] text-xs">
                        {me.share_publicly
                          ? "Other members can see your name in this organization"
                          : "Your membership is hidden from other members"}
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-xs text-gray-500">
                      {me.share_publicly ? "Visible" : "Private"}
                    </span>
                    <Switch
                      checked={me.share_publicly}
                      disabled={toggling === me.id}
                      onCheckedChange={() => toggleVisibility(me.id, me.share_publicly)}
                    />
                  </div>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other members */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1E3A5F]" />
            <h2 className="text-sm font-semibold text-[#1E3A5F]">
              Organization Members ({members.length})
            </h2>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No members yet.</p>
          ) : (
            <div className="space-y-2">
              {members
                .filter((m) => m.clerk_user_id !== userId)
                .map((m) => (
                  <Card key={m.id}>
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {m.share_publicly
                            ? (m.display_name ?? "?")[0].toUpperCase()
                            : <EyeOff className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {m.share_publicly
                              ? (m.display_name ?? "Member")
                              : <span className="text-gray-400 italic">Private member</span>}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        Joined {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              {members.filter((m) => m.clerk_user_id !== userId).length === 0 && (
                <p className="text-sm text-gray-400 py-2">You're the only member so far.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
