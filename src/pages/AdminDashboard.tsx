import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  AlertTriangle, CheckCircle2, Clock, ShieldCheck, ShieldOff,
  Inbox, Loader2, Megaphone, Trash2, Home,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { useUserRole } from "@/contexts/UserRoleContext"
import type { Database } from "@/lib/database.types"

type Island = Database["public"]["Enums"]["island"]
type ServiceType = Database["public"]["Enums"]["service_type"]
type VolunteerSkill = Database["public"]["Enums"]["volunteer_skill"]

const ISLANDS: Island[] = ["guam", "saipan", "tinian", "rota"]
const SERVICE_TYPES: ServiceType[] = [
  "shelter", "food", "water", "medical", "tarps", "cleanup", "clothing", "transportation", "information",
]
const ISLAND_LABELS: Record<Island, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}
const SERVICE_LABELS: Record<ServiceType, string> = {
  shelter: "Shelter", food: "Food", water: "Water", medical: "Medical",
  tarps: "Tarps", cleanup: "Cleanup", clothing: "Clothing",
  transportation: "Transportation", information: "Information",
}
const SKILL_LABELS: Record<string, string> = {
  cleanup: "Cleanup", food_distribution: "Food Distribution",
  shelter_management: "Shelter Mgmt", transportation: "Transportation",
  medical_support: "Medical", emotional_support: "Emotional Support",
  childcare: "Childcare", translation: "Translation",
  general_labor: "General Labor", other: "Other",
}
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  provider: "Provider",
  unverified: "Unverified",
  recipient: "Recipient",
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100)
}

// ── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { supabaseClient } = useAuth()

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin", "aid_requests"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("aid_requests")
        .select("id, island, needs, status")
      if (error) throw error
      return data as { id: string; island: Island; needs: ServiceType[]; status: string }[]
    },
  })

  const total = requests?.length ?? 0
  const fulfilledCount = requests?.filter((r) => r.status === "fulfilled").length ?? 0
  const pendingCount = requests?.filter((r) => r.status === "open" || r.status === "responding").length ?? 0

  const byIsland = ISLANDS.reduce((acc, island) => ({
    ...acc,
    [island]: requests?.filter((r) => r.island === island).length ?? 0,
  }), {} as Record<Island, number>)

  const byNeed = SERVICE_TYPES.reduce((acc, type) => {
    acc[type] = requests?.filter((r) => r.needs?.includes(type)).length ?? 0
    return acc
  }, {} as Record<ServiceType, number>)

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold mb-3">Aid Request Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard icon={<Inbox className="h-5 w-5 text-muted-foreground" />} label="Total Requests" value={total.toString()} />
          <MetricCard icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Fulfilled" value={`${pct(fulfilledCount, total)}%`} sub={`${fulfilledCount} of ${total}`} />
          <MetricCard icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Pending / Active" value={`${pct(pendingCount, total)}%`} sub={`${pendingCount} of ${total}`} />
        </div>
      </section>
      <section>
        <h2 className="text-base font-semibold mb-3">By Island</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ISLANDS.map((island) => (
            <Card key={island}>
              <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-sm font-medium text-muted-foreground">{ISLAND_LABELS[island]}</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold">{byIsland[island]}</p>
                <p className="text-xs text-muted-foreground">{pct(byIsland[island], total)}% of total</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-base font-semibold mb-3">By Need Type</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_TYPES.map((type) => (
            <Card key={type}>
              <CardHeader className="pb-1 pt-4 px-4"><CardTitle className="text-sm font-medium text-muted-foreground">{SERVICE_LABELS[type]}</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl font-bold">{byNeed[type]}</p>
                <p className="text-xs text-muted-foreground">{pct(byNeed[type], total)}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Organizations tab ─────────────────────────────────────────────────────────

function OrgsTab() {
  const { supabaseClient } = useAuth()
  const [updating, setUpdating] = useState<string | null>(null)

  const { data: orgs, isLoading, refetch } = useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("organizations")
        .select("id, name, contact_phone, contact_email, whatsapp, islands, service_types, verified, verification_requested, created_at")
        .order("verification_requested", { ascending: false })
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  async function toggleVerified(id: string, current: boolean) {
    setUpdating(id)
    const { error } = await supabaseClient
      .from("organizations")
      .update({ verified: !current, verification_requested: current ? false : true })
      .eq("id", id)
    if (error) toast.error("Update failed: " + error.message)
    else { toast.success(current ? "Org unverified." : "Org verified!"); refetch() }
    setUpdating(null)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>

  const queue = orgs?.filter((o) => o.verification_requested && !o.verified) ?? []
  const verified = orgs?.filter((o) => o.verified) ?? []
  const unverified = orgs?.filter((o) => !o.verified && !o.verification_requested) ?? []

  function OrgCard({ org }: { org: typeof orgs[number] }) {
    return (
      <Card className={`border ${org.verified ? "border-green-500/30 bg-green-500/5" : org.verification_requested ? "border-yellow-500/40 bg-yellow-500/5" : ""}`}>
        <CardContent className="px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-semibold text-sm">{org.name}</p>
              <p className="text-xs text-muted-foreground">
                {org.contact_phone}{org.contact_email ? ` · ${org.contact_email}` : ""}{org.whatsapp ? ` · WA: ${org.whatsapp}` : ""}
              </p>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {(org.islands as Island[]).map((i) => (
                  <Badge key={i} variant="outline" className="text-xs">{ISLAND_LABELS[i]}</Badge>
                ))}
                {(org.service_types as ServiceType[]).map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{SERVICE_LABELS[s]}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {org.verified
                ? <><ShieldCheck className="h-4 w-4 text-green-600" /><span className="text-xs text-green-600 font-medium">Verified</span></>
                : org.verification_requested
                  ? <><ShieldOff className="h-4 w-4 text-yellow-600" /><span className="text-xs text-yellow-600 font-medium">Pending</span></>
                  : <><ShieldOff className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Unverified</span></>
              }
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              variant={org.verified ? "outline" : "default"}
              className={org.verified ? "h-7 text-xs" : "h-7 text-xs bg-[#1E3A5F]"}
              disabled={updating === org.id}
              onClick={() => toggleVerified(org.id, org.verified)}
            >
              {updating === org.id
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : org.verified ? "Unverify" : "Verify ✓"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {queue.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-2 text-yellow-700">Verification Queue ({queue.length})</h2>
          <div className="space-y-2">{queue.map((o) => <OrgCard key={o.id} org={o} />)}</div>
        </section>
      )}
      {verified.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-2 text-green-700">Verified ({verified.length})</h2>
          <div className="space-y-2">{verified.map((o) => <OrgCard key={o.id} org={o} />)}</div>
        </section>
      )}
      {unverified.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-2 text-muted-foreground">Not Requested ({unverified.length})</h2>
          <div className="space-y-2">{unverified.map((o) => <OrgCard key={o.id} org={o} />)}</div>
        </section>
      )}
      {(orgs?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">No organizations yet.</p>
      )}
    </div>
  )
}

// ── Volunteers tab ────────────────────────────────────────────────────────────

function VolunteersTab() {
  const { supabaseClient } = useAuth()

  const { data: signups, isLoading: loadingSignups } = useQuery({
    queryKey: ["admin", "volunteer_signups"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("volunteer_signups")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  const { data: leaders, isLoading: loadingLeaders } = useQuery({
    queryKey: ["admin", "volunteer_leader_signups"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("volunteer_leader_signups")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  function SkillChips({ skills }: { skills: string[] }) {
    return (
      <div className="flex flex-wrap gap-1">
        {skills.map((s) => (
          <span key={s} className="rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] text-xs px-2 py-0.5">
            {SKILL_LABELS[s] ?? s}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold mb-3">
          General Sign-ups ({loadingSignups ? "…" : (signups?.length ?? 0)})
        </h2>
        {loadingSignups ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (signups?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No sign-ups yet.</p>
        ) : (
          <div className="space-y-2">
            {signups!.map((s) => (
              <Card key={s.id} className="border border-border">
                <CardContent className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{s.display_name ?? <span className="text-muted-foreground italic">Anonymous</span>}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      {s.island && <Badge variant="outline" className="text-xs">{ISLAND_LABELS[s.island as Island] ?? s.island}</Badge>}
                      {s.is_public ? <Badge variant="outline" className="text-xs">Public</Badge> : <Badge variant="secondary" className="text-xs">Private</Badge>}
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <SkillChips skills={s.skills ?? []} />
                  {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">
          Leader Sign-ups ({loadingLeaders ? "…" : (leaders?.length ?? 0)})
        </h2>
        {loadingLeaders ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (leaders?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No leader sign-ups yet.</p>
        ) : (
          <div className="space-y-2">
            {leaders!.map((l) => (
              <Card key={l.id} className="border border-border">
                <CardContent className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{l.display_name ?? <span className="text-muted-foreground italic">Anonymous</span>}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      {l.island && <Badge variant="outline" className="text-xs">{ISLAND_LABELS[l.island as Island] ?? l.island}</Badge>}
                      {l.team_capacity != null && <span className="text-xs">Up to {l.team_capacity} volunteers</span>}
                      <span>{new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <SkillChips skills={l.skills ?? []} />
                  {l.experience && <p className="text-xs text-muted-foreground italic">"{l.experience}"</p>}
                  {l.notes && <p className="text-xs text-muted-foreground">{l.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const { supabaseClient, user: currentUser } = useAuth()
  const [updating, setUpdating] = useState<string | null>(null)

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, clerk_user_id, display_name, email, role, created_at")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  async function updateRole(clerkUserId: string, newRole: string) {
    setUpdating(clerkUserId)
    const { error } = await supabaseClient
      .from("profiles")
      .update({ role: newRole })
      .eq("clerk_user_id", clerkUserId)
    if (error) toast.error("Update failed: " + error.message)
    else { toast.success("Role updated."); refetch() }
    setUpdating(null)
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {users?.length ?? 0} registered user{users?.length !== 1 ? "s" : ""}
      </p>
      {(users?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">No users yet.</p>
      )}
      {users?.map((u) => (
        <Card key={u.id} className="border border-border">
          <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-medium text-sm">{u.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {u.email ?? <span className="italic">no email</span>}
                {u.clerk_user_id === currentUser?.id && (
                  <span className="ml-2 text-[#1E3A5F] font-medium">(you)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={u.role}
                onValueChange={(v) => updateRole(u.clerk_user_id!, v)}
                disabled={updating === u.clerk_user_id}
              >
                <SelectTrigger className="h-8 text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="recipient">Recipient</SelectItem>
                </SelectContent>
              </Select>
              {updating === u.clerk_user_id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Announcements tab ─────────────────────────────────────────────────────────

function AnnouncementsTab() {
  const { supabaseClient } = useAuth()
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ message: "", action_label: "", action_url: "", priority: "0" })

  const { data: announcements, isLoading, refetch } = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("announcements")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  async function create() {
    if (!form.message.trim()) return toast.error("Message is required.")
    setSaving(true)
    const { error } = await supabaseClient.from("announcements").insert({
      message: form.message.trim(),
      action_label: form.action_label.trim() || null,
      action_url: form.action_url.trim() || null,
      priority: parseInt(form.priority) || 0,
      is_active: true,
    })
    if (error) toast.error("Failed: " + error.message)
    else {
      toast.success("Announcement created.")
      setForm({ message: "", action_label: "", action_url: "", priority: "0" })
      refetch()
    }
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id)
    const { error } = await supabaseClient
      .from("announcements")
      .update({ is_active: !current })
      .eq("id", id)
    if (error) toast.error("Update failed.")
    else refetch()
    setToggling(null)
  }

  async function remove(id: string) {
    setDeleting(id)
    const { error } = await supabaseClient.from("announcements").delete().eq("id", id)
    if (error) toast.error("Delete failed.")
    else { toast.success("Deleted."); refetch() }
    setDeleting(null)
  }

  return (
    <div className="space-y-8">
      {/* Create form */}
      <section>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Megaphone className="h-4 w-4" /> New Announcement
        </h2>
        <Card className="border border-border">
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ann-message">Message <span className="text-destructive">*</span></Label>
              <Textarea
                id="ann-message"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="FEMA Declaration approved — federal relief activated."
                className="min-h-[72px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ann-label">Button label <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input
                  id="ann-label"
                  value={form.action_label}
                  onChange={(e) => setForm((p) => ({ ...p, action_label: e.target.value }))}
                  placeholder="Learn more"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ann-url">Button URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input
                  id="ann-url"
                  value={form.action_url}
                  onChange={(e) => setForm((p) => ({ ...p, action_url: e.target.value }))}
                  placeholder="/info or https://…"
                />
              </div>
            </div>
            <div className="space-y-1.5 w-28">
              <Label htmlFor="ann-priority">Priority <span className="text-xs text-muted-foreground">(higher = first)</span></Label>
              <Input
                id="ann-priority"
                type="number"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              />
            </div>
            <Button
              onClick={create}
              disabled={saving}
              className="bg-[#1E3A5F] w-full sm:w-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? "Saving…" : "Post Announcement"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* List */}
      <section>
        <h2 className="text-base font-semibold mb-3">All Announcements</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (announcements?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        )}
        <div className="space-y-2">
          {announcements?.map((a) => (
            <Card key={a.id} className={`border ${a.is_active ? "border-[#1E3A5F]/30 bg-[#1E3A5F]/5" : "border-border opacity-60"}`}>
              <CardContent className="px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug">{a.message}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">P{a.priority}</span>
                    <Switch
                      checked={a.is_active}
                      disabled={toggling === a.id}
                      onCheckedChange={() => toggleActive(a.id, a.is_active)}
                    />
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deleting === a.id}
                      className="text-muted-foreground hover:text-destructive transition"
                    >
                      {deleting === a.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </div>
                {a.action_label && a.action_url && (
                  <p className="text-xs text-muted-foreground">
                    Button: <span className="font-medium">{a.action_label}</span> → {a.action_url}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {a.is_active ? "Active" : "Inactive"} · {new Date(a.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── News tab ─────────────────────────────────────────────────────────────────

function NewsTab() {
  const { supabaseClient } = useAuth()
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({
    source_url: "",
    title: "",
    summary: "",
    category: "federal",
    featured: false,
  })

  const { data: articles, isLoading, refetch } = useQuery({
    queryKey: ["admin", "news_articles"],
    queryFn: async () => {
      // Admin needs to see all articles, not just published
      const { data, error } = await supabaseClient
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as any[]
    },
  })

  async function addArticle() {
    if (!form.source_url.trim()) return toast.error("Source URL is required.")
    if (!form.title.trim()) return toast.error("Title is required.")
    setSaving(true)
    const { error } = await supabaseClient.from("news_articles").insert({
      source_url: form.source_url.trim(),
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      category: form.category,
      featured: form.featured,
      status: "published",
      published_at: new Date().toISOString(),
    })
    if (error) toast.error("Failed: " + error.message)
    else {
      toast.success("News article added.")
      setForm({ source_url: "", title: "", summary: "", category: "federal", featured: false })
      refetch()
    }
    setSaving(false)
  }

  async function toggleStatus(id: string, current: string) {
    setToggling(id)
    const next = current === "published" ? "draft" : "published"
    const { error } = await supabaseClient
      .from("news_articles")
      .update({
        status: next,
        published_at: next === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id)
    if (error) toast.error("Update failed.")
    else refetch()
    setToggling(null)
  }

  async function toggleFeatured(id: string, current: boolean) {
    setToggling(id)
    // Unfeatured all first if setting featured
    if (!current) {
      await supabaseClient.from("news_articles").update({ featured: false }).eq("featured", true)
    }
    const { error } = await supabaseClient.from("news_articles").update({ featured: !current }).eq("id", id)
    if (error) toast.error("Update failed.")
    else refetch()
    setToggling(null)
  }

  async function remove(id: string) {
    setDeleting(id)
    const { error } = await supabaseClient.from("news_articles").delete().eq("id", id)
    if (error) toast.error("Delete failed.")
    else { toast.success("Deleted."); refetch() }
    setDeleting(null)
  }

  const CATEGORY_OPTIONS = [
    { value: "federal", label: "Federal" },
    { value: "local", label: "Local" },
    { value: "community", label: "Community" },
    { value: "weather", label: "Weather" },
  ]

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold mb-3">Add News Article</h2>
        <Card className="border border-border">
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="news-url">Source URL <span className="text-destructive">*</span></Label>
              <Input
                id="news-url"
                type="url"
                value={form.source_url}
                onChange={(e) => setForm((p) => ({ ...p, source_url: e.target.value }))}
                placeholder="https://www.fema.gov/press-release/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="news-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="news-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Emergency Declaration Approved for Guam"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="news-summary">Summary <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="news-summary"
                value={form.summary}
                onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                placeholder="Brief summary of the article..."
                className="min-h-[60px]"
              />
            </div>
            <div className="flex gap-4 items-end">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
            </div>
            <Button
              onClick={addArticle}
              disabled={saving}
              className="bg-[#1E3A5F] w-full sm:w-auto"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? "Saving…" : "Publish Article"}
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-3">All Articles ({isLoading ? "…" : articles?.length ?? 0})</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (articles?.length ?? 0) === 0 && (
          <p className="text-sm text-muted-foreground">No articles yet.</p>
        )}
        <div className="space-y-2">
          {articles?.map((a: any) => (
            <Card key={a.id} className={`border ${a.status === "published" ? "border-border" : "border-border opacity-60"} ${a.featured ? "border-[#1E3A5F]/40 bg-[#1E3A5F]/5" : ""}`}>
              <CardContent className="px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {a.featured && <Badge className="text-xs bg-[#1E3A5F]">Featured</Badge>}
                      <Badge variant="outline" className="text-xs">{a.category}</Badge>
                      <Badge variant={a.status === "published" ? "default" : "secondary"} className="text-xs">
                        {a.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm">{a.title}</p>
                    {a.summary && <p className="text-xs text-muted-foreground">{a.summary}</p>}
                    <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1E3A5F] hover:underline">
                      {a.source_url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={toggling === a.id}
                      onClick={() => toggleFeatured(a.id, a.featured)}
                    >
                      {a.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={toggling === a.id}
                      onClick={() => toggleStatus(a.id, a.status)}
                    >
                      {a.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deleting === a.id}
                      className="text-muted-foreground hover:text-destructive transition"
                    >
                      {deleting === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { loading: authLoading } = useAuth()
  const { isAdmin, loading: roleLoading } = useUserRole()

  const loading = authLoading || roleLoading

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("Access denied.")
      navigate("/")
    }
  }, [isAdmin, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
              Typhoon Sinlaku — Admin Dashboard
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 bg-[#1E3A5F] text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#2a4f7a] transition"
          >
            <Home className="h-3.5 w-3.5" /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 grid grid-cols-6 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="organizations">Orgs</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="announcements">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="organizations"><OrgsTab /></TabsContent>
          <TabsContent value="volunteers"><VolunteersTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="news"><NewsTab /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-4 px-4 flex flex-row items-center gap-2">
        {icon}
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
