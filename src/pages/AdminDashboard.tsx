import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  AlertTriangle, CheckCircle2, Clock, ShieldOff,
  Inbox, Loader2, Megaphone, Trash2, Home, ChevronDown, ChevronUp,
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
import OrgAdminCard from "@/components/OrgAdminCard"

type Island = Database["public"]["Enums"]["island"]
type ServiceType = Database["public"]["Enums"]["service_type"]
type OrgCategory = Database["public"]["Enums"]["org_category"]
type VolunteerSkill = Database["public"]["Enums"]["volunteer_skill"]

const ORG_CATEGORY_OPTIONS: { value: OrgCategory; label: string }[] = [
  { value: "uncategorized", label: "Uncategorized" },
  { value: "federal_agency", label: "Federal Agency (e.g. FEMA)" },
  { value: "national_ngo", label: "National NGO (e.g. Red Cross)" },
  { value: "local_government", label: "Gov. Agency (GovGuam / CNMI)" },
  { value: "local_ngo", label: "Local NGO / Nonprofit" },
  { value: "faith_based", label: "Faith-Based Organization" },
  { value: "community", label: "Community Group" },
]

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
const AVAILABILITY_LABELS: Record<string, string> = {
  weekday_mornings: "Wkdy AM", weekday_afternoons: "Wkdy PM",
  weekday_evenings: "Wkdy Eve", weekend_mornings: "Wknd AM",
  weekend_afternoons: "Wknd PM", weekend_evenings: "Wknd Eve",
  anytime: "Anytime",
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

function OrgSection({
  title, titleClass, orgs, refetch,
}: {
  title: string
  titleClass: string
  orgs: any[]
  refetch: () => void
}) {
  const [open, setOpen] = useState(true)
  if (orgs.length === 0) return null
  return (
    <section>
      <button
        className="flex items-center gap-2 mb-2 w-full text-left group"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className={`text-base font-semibold ${titleClass}`}>
          {title} ({orgs.length})
        </h2>
        {open
          ? <ChevronUp className={`h-4 w-4 ${titleClass} opacity-60 group-hover:opacity-100`} />
          : <ChevronDown className={`h-4 w-4 ${titleClass} opacity-60 group-hover:opacity-100`} />
        }
      </button>
      {open && (
        <div className="space-y-2">
          {orgs.map((o) => <OrgAdminCard key={o.id} org={o as any} onRefetch={refetch} />)}
        </div>
      )}
    </section>
  )
}

function OrgsTab() {
  const { supabaseClient } = useAuth()

  const { data: orgs, isLoading, refetch } = useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("organizations")
        .select("id, name, contact_phone, contact_email, whatsapp, islands, service_types, verified, verification_requested, org_category, hidden_from_map, created_at")
        .order("verification_requested", { ascending: false })
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>

  const queue = orgs?.filter((o) => o.verification_requested && !o.verified) ?? []
  const verified = orgs?.filter((o) => o.verified) ?? []
  const unverified = orgs?.filter((o) => !o.verified && !o.verification_requested) ?? []

  return (
    <div className="space-y-6">
      <OrgSection title="Verification Queue" titleClass="text-yellow-700" orgs={queue} refetch={refetch} />
      <OrgSection title="Verified" titleClass="text-green-700" orgs={verified} refetch={refetch} />
      <OrgSection title="Not Requested" titleClass="text-muted-foreground" orgs={unverified} refetch={refetch} />
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
                  {(s.availability ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(s.availability as string[]).map((a) => (
                        <span key={a} className="rounded-full bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                          {AVAILABILITY_LABELS[a] ?? a}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.contact && (
                    <p className="text-xs text-muted-foreground font-medium">📞 {s.contact}</p>
                  )}
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
                  {(l.availability ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(l.availability as string[]).map((a) => (
                        <span key={a} className="rounded-full bg-gray-100 text-gray-600 text-xs px-2 py-0.5">
                          {AVAILABILITY_LABELS[a] ?? a}
                        </span>
                      ))}
                    </div>
                  )}
                  {l.contact && (
                    <p className="text-xs text-muted-foreground font-medium">📞 {l.contact}</p>
                  )}
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

// ── Funds tab ─────────────────────────────────────────────────────────────────

function FundsTab() {
  const { supabaseClient, user } = useAuth()
  const [approvingLeader, setApprovingLeader] = useState<string | null>(null)
  const [savingDonation, setSavingDonation] = useState(false)
  const [savingTxn, setSavingTxn] = useState(false)
  const [donationForm, setDonationForm] = useState({ amount: "", donor_name: "", donor_email: "", island_earmark: "", status: "confirmed", payment_method: "other", message: "" })
  const [txnForm, setTxnForm] = useState({ fund_leader_id: "", amount: "", type: "allocation", description: "", receipt_url: "" })

  const { data: leaders, isLoading: loadingLeaders, refetch: refetchLeaders } = useQuery({
    queryKey: ["admin", "fund_leaders"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("fund_leaders")
        .select("*, organizations(name)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as any[]
    },
  })

  const { data: donations, isLoading: loadingDonations, refetch: refetchDonations } = useQuery({
    queryKey: ["admin", "donations"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("donations")
        .select("id, amount, donor_name, donor_email, status, payment_method, island_earmark, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50)
      if (error) throw error
      return data as any[]
    },
  })

  const { data: txnStats } = useQuery({
    queryKey: ["admin", "fund_transaction_stats"],
    queryFn: async () => {
      const { data, error } = await supabaseClient
        .from("fund_transactions")
        .select("amount, type, receipt_url")
      if (error) throw error
      const allocated = (data ?? []).filter(t => t.type === "allocation").reduce((s, t) => s + Number(t.amount), 0)
      const disbursed = (data ?? []).filter(t => t.type === "disbursement").reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
      const disbursedWithReceipt = (data ?? []).filter(t => t.type === "disbursement" && t.receipt_url).reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
      return { allocated, disbursed, disbursedWithReceipt, disbursedWithoutReceipt: disbursed - disbursedWithReceipt }
    },
  })

  const totalConfirmed = (donations ?? []).filter((d) => d.status === "confirmed").reduce((s: number, d: any) => s + Number(d.amount), 0)
  const totalPending = (donations ?? []).filter((d) => d.status === "pending").reduce((s: number, d: any) => s + Number(d.amount), 0)
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)

  async function approveLeader(id: string, status: "approved" | "suspended") {
    setApprovingLeader(id)
    const { error } = await supabaseClient
      .from("fund_leaders")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
        approved_by: user?.id ?? null,
      })
      .eq("id", id)
    if (error) toast.error("Update failed: " + error.message)
    else { toast.success(status === "approved" ? "Fund leader approved." : "Suspended."); refetchLeaders() }
    setApprovingLeader(null)
  }

  async function confirmDonation(id: string) {
    const { error } = await supabaseClient.from("donations").update({ status: "confirmed" }).eq("id", id)
    if (error) toast.error("Failed.")
    else { toast.success("Donation confirmed."); refetchDonations() }
  }

  async function addDonation() {
    if (!donationForm.amount || isNaN(parseFloat(donationForm.amount))) return toast.error("Valid amount required.")
    setSavingDonation(true)
    const { data: campaign } = await supabaseClient.from("donation_campaigns").select("id").eq("is_active", true).limit(1).single()
    const { error } = await supabaseClient.from("donations").insert({
      campaign_id: campaign?.id ?? null,
      amount: parseFloat(donationForm.amount),
      donor_name: donationForm.donor_name.trim() || null,
      donor_email: donationForm.donor_email.trim() || null,
      island_earmark: (donationForm.island_earmark as any) || null,
      message: donationForm.message.trim() || null,
      status: donationForm.status,
      payment_method: donationForm.payment_method,
      is_public: true,
    })
    if (error) toast.error("Failed: " + error.message)
    else {
      toast.success("Donation recorded.")
      setDonationForm({ amount: "", donor_name: "", donor_email: "", island_earmark: "", status: "confirmed", payment_method: "other", message: "" })
      refetchDonations()
    }
    setSavingDonation(false)
  }

  async function addTransaction() {
    if (!txnForm.fund_leader_id) return toast.error("Select a fund leader.")
    if (!txnForm.amount || isNaN(parseFloat(txnForm.amount))) return toast.error("Valid amount required.")
    if (!txnForm.description.trim()) return toast.error("Description required.")
    setSavingTxn(true)
    const { error } = await supabaseClient.from("fund_transactions").insert({
      fund_leader_id: txnForm.fund_leader_id,
      amount: parseFloat(txnForm.amount),
      type: txnForm.type,
      description: txnForm.description.trim(),
      receipt_url: txnForm.receipt_url.trim() || null,
      recorded_by: user?.id ?? null,
    })
    if (error) toast.error("Failed: " + error.message)
    else {
      toast.success("Transaction recorded.")
      setTxnForm({ fund_leader_id: "", amount: "", type: "allocation", description: "", receipt_url: "" })
    }
    setSavingTxn(false)
  }

  const approvedLeaders = (leaders ?? []).filter((l) => l.status === "approved")

  return (
    <div className="space-y-10">

      {/* Summary */}
      <section>
        <h2 className="text-base font-semibold mb-3">Donation Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="border-green-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Confirmed</p><p className="text-xl font-bold text-green-700">{fmt(totalConfirmed)}</p></CardContent></Card>
          <Card className="border-amber-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Pending Confirmation</p><p className="text-xl font-bold text-amber-600">{fmt(totalPending)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Total Records</p><p className="text-xl font-bold">{donations?.length ?? 0}</p></CardContent></Card>
        </div>
      </section>

      {/* Allocation & Audit Analytics */}
      {txnStats && (
        <section>
          <h2 className="text-base font-semibold mb-3">Fund Allocation & Audit</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-blue-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Allocated to Leaders</p><p className="text-xl font-bold text-blue-700">{fmt(txnStats.allocated)}</p></CardContent></Card>
            <Card className="border-amber-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Unallocated</p><p className="text-xl font-bold text-amber-600">{fmt(totalConfirmed - txnStats.allocated)}</p></CardContent></Card>
            <Card className="border-green-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Disbursed (with receipt)</p><p className="text-xl font-bold text-green-700">{fmt(txnStats.disbursedWithReceipt)}</p></CardContent></Card>
            <Card className="border-orange-200"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Disbursed (no receipt)</p><p className="text-xl font-bold text-orange-600">{fmt(txnStats.disbursedWithoutReceipt)}</p></CardContent></Card>
          </div>
        </section>
      )}

      {/* Fund Leader Management */}
      <section>
        <h2 className="text-base font-semibold mb-3">Fund Leader Management</h2>
        {loadingLeaders ? <p className="text-sm text-muted-foreground">Loading…</p> : (leaders?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-4">
            {/* Pending queue */}
            {(leaders ?? []).filter(l => l.status === "pending").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-700 mb-2">Pending Approval ({(leaders ?? []).filter(l => l.status === "pending").length})</h3>
                <div className="space-y-2">
                  {(leaders ?? []).filter(l => l.status === "pending").map((l) => (
                    <Card key={l.id} className="border-2 border-amber-300 bg-amber-50/50">
                      <CardContent className="px-4 py-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{l.display_name}</p>
                              <Badge variant="outline" className="text-xs text-amber-700 border-amber-400">Pending</Badge>
                              <Badge variant="outline" className="text-xs">{ISLAND_LABELS[l.island as Island] ?? l.island}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{l.organizations?.name}</p>
                            <p className="text-xs text-muted-foreground">{l.address}</p>
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              {l.contact_email && <span>{l.contact_email}</span>}
                              {l.contact_phone && <span>{l.contact_phone}</span>}
                            </div>
                            {l.intended_services && (
                              <div className="mt-1 bg-white rounded px-2 py-1.5 border text-xs">
                                <span className="font-medium text-muted-foreground">Intended use: </span>{l.intended_services}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" className="h-7 text-xs bg-green-700 hover:bg-green-800"
                              disabled={approvingLeader === l.id}
                              onClick={() => approveLeader(l.id, "approved")}>Approve</Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs"
                              disabled={approvingLeader === l.id}
                              onClick={() => approveLeader(l.id, "suspended")}>Reject</Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Applied {new Date(l.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {/* Approved */}
            {(leaders ?? []).filter(l => l.status === "approved").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-2">Approved ({(leaders ?? []).filter(l => l.status === "approved").length})</h3>
                <div className="space-y-2">
                  {(leaders ?? []).filter(l => l.status === "approved").map((l) => (
                    <Card key={l.id} className="border border-green-200">
                      <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{l.display_name}</p>
                            <Badge className="text-xs bg-green-700">Approved</Badge>
                            <Badge variant="outline" className="text-xs">{ISLAND_LABELS[l.island as Island] ?? l.island}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{l.organizations?.name} · {l.address}</p>
                          {l.intended_services && <p className="text-xs text-muted-foreground italic">{l.intended_services}</p>}
                        </div>
                        <Button size="sm" variant="destructive" className="h-7 text-xs shrink-0"
                          disabled={approvingLeader === l.id}
                          onClick={() => approveLeader(l.id, "suspended")}>Suspend</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {/* Suspended */}
            {(leaders ?? []).filter(l => l.status === "suspended").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">Suspended ({(leaders ?? []).filter(l => l.status === "suspended").length})</h3>
                <div className="space-y-2">
                  {(leaders ?? []).filter(l => l.status === "suspended").map((l) => (
                    <Card key={l.id} className="border border-border opacity-60">
                      <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{l.display_name}</p>
                            <Badge variant="destructive" className="text-xs">Suspended</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{l.organizations?.name} · {ISLAND_LABELS[l.island as Island] ?? l.island}</p>
                        </div>
                        <Button size="sm" className="h-7 text-xs bg-green-700 hover:bg-green-800 shrink-0"
                          disabled={approvingLeader === l.id}
                          onClick={() => approveLeader(l.id, "approved")}>Re-approve</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Record a Donation */}
      <section>
        <h2 className="text-base font-semibold mb-3">Record a Donation (offline / manual)</h2>
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount ($) <span className="text-destructive">*</span></Label>
                <Input placeholder="100" value={donationForm.amount} onChange={(e) => setDonationForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select value={donationForm.payment_method} onValueChange={(v) => setDonationForm(p => ({ ...p, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wire">Wire</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Donor name (optional)</Label>
                <Input placeholder="Anonymous" value={donationForm.donor_name} onChange={(e) => setDonationForm(p => ({ ...p, donor_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Donor email (optional)</Label>
                <Input type="email" placeholder="donor@example.com" value={donationForm.donor_email} onChange={(e) => setDonationForm(p => ({ ...p, donor_email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Island earmark</Label>
                <Select value={donationForm.island_earmark} onValueChange={(v) => setDonationForm(p => ({ ...p, island_earmark: v }))}>
                  <SelectTrigger><SelectValue placeholder="General" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">General</SelectItem>
                    <SelectItem value="guam">Guam</SelectItem>
                    <SelectItem value="saipan">Saipan</SelectItem>
                    <SelectItem value="tinian">Tinian</SelectItem>
                    <SelectItem value="rota">Rota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={donationForm.status} onValueChange={(v) => setDonationForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message / notes</Label>
              <Input placeholder="Any notes" value={donationForm.message} onChange={(e) => setDonationForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <Button onClick={addDonation} disabled={savingDonation} className="bg-[#1E3A5F]">
              {savingDonation ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Donation"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Record a Transaction */}
      <section>
        <h2 className="text-base font-semibold mb-3">Record Fund Transaction (allocation / disbursement)</h2>
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Fund Leader <span className="text-destructive">*</span></Label>
                <Select value={txnForm.fund_leader_id} onValueChange={(v) => setTxnForm(p => ({ ...p, fund_leader_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select leader…" /></SelectTrigger>
                  <SelectContent>
                    {approvedLeaders.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.display_name} ({ISLAND_LABELS[l.island as Island] ?? l.island})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type <span className="text-destructive">*</span></Label>
                <Select value={txnForm.type} onValueChange={(v) => setTxnForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allocation">Allocation (funds sent to leader)</SelectItem>
                    <SelectItem value="disbursement">Disbursement (spent on relief)</SelectItem>
                    <SelectItem value="return">Return (funds returned)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount ($) <span className="text-destructive">*</span></Label>
                <Input placeholder="500" value={txnForm.amount} onChange={(e) => setTxnForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Receipt URL (optional)</Label>
                <Input placeholder="https://…" value={txnForm.receipt_url} onChange={(e) => setTxnForm(p => ({ ...p, receipt_url: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-destructive">*</span></Label>
              <Input placeholder="Food distribution supplies — Dededo shelter, April 15" value={txnForm.description} onChange={(e) => setTxnForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <Button onClick={addTransaction} disabled={savingTxn} className="bg-[#1E3A5F]">
              {savingTxn ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Transaction"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Donation log */}
      <section>
        <h2 className="text-base font-semibold mb-3">Donation Log</h2>
        {loadingDonations ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-2">
            {(donations ?? []).map((d) => (
              <Card key={d.id} className="border border-border">
                <CardContent className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{d.donor_name ?? "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.payment_method} · {d.island_earmark ? ISLAND_LABELS[d.island_earmark as Island] ?? d.island_earmark : "General"}
                      {" "}· {new Date(d.created_at).toLocaleDateString()}
                    </p>
                    {d.donor_email && <p className="text-xs text-muted-foreground">{d.donor_email}</p>}
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className="font-bold">${Number(d.amount).toLocaleString()}</p>
                      <Badge variant={d.status === "confirmed" ? "default" : d.status === "pending" ? "outline" : "destructive"} className="text-xs">
                        {d.status}
                      </Badge>
                    </div>
                    {d.status === "pending" && (
                      <Button size="sm" className="h-7 text-xs bg-green-700 hover:bg-green-800" onClick={() => confirmDonation(d.id)}>
                        Confirm
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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

// ── Phone Corrections tab ─────────────────────────────────────────────────────

type PhoneCorrection = {
  id: string
  contact_label: string
  current_number: string
  suggested_number: string
  notes: string | null
  submitted_by_name: string | null
  status: string
  created_at: string
}

function PhoneCorrectionsTab() {
  const { supabaseClient } = useAuth()

  const { data: corrections, isLoading, refetch } = useQuery({
    queryKey: ["admin", "phone_corrections"],
    queryFn: async () => {
      const { data, error } = await (supabaseClient as any)
        .from("phone_corrections")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data as PhoneCorrection[]
    },
  })

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    const { error } = await (supabaseClient as any)
      .from("phone_corrections")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) { toast.error("Update failed"); return }
    toast.success(`Correction ${status}`)
    refetch()
  }

  const pending = corrections?.filter((c) => c.status === "pending") ?? []
  const reviewed = corrections?.filter((c) => c.status !== "pending") ?? []

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1E3A5F] mb-1">Phone Number Corrections</h2>
        <p className="text-xs text-muted-foreground">Community-submitted corrections for unverified emergency contact numbers.</p>
      </div>

      <section>
        <h3 className="text-sm font-semibold mb-3 text-orange-700">Pending ({pending.length})</h3>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-400">No pending corrections.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <Card key={c.id} className="border-orange-200 bg-orange-50/50">
                <CardContent className="px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.contact_label}</p>
                      <p className="text-xs text-muted-foreground">
                        Current: <span className="font-mono">{c.current_number}</span>
                        {" → "}
                        Suggested: <span className="font-mono font-bold text-orange-700">{c.suggested_number}</span>
                      </p>
                      {c.notes && <p className="text-xs text-gray-500 mt-0.5">Note: {c.notes}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        By {c.submitted_by_name ?? "Anonymous"} · {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" className="text-xs border-green-400 text-green-700 hover:bg-green-50" onClick={() => updateStatus(c.id, "accepted")}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs border-red-300 text-red-600 hover:bg-red-50" onClick={() => updateStatus(c.id, "rejected")}>
                        <ShieldOff className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3 text-gray-500">Reviewed ({reviewed.length})</h3>
          <div className="space-y-2">
            {reviewed.map((c) => (
              <Card key={c.id} className="opacity-60">
                <CardContent className="px-4 py-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium">{c.contact_label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.current_number} → {c.suggested_number}</p>
                  </div>
                  <Badge variant={c.status === "accepted" ? "default" : "outline"} className="text-xs capitalize">
                    {c.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
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
          <TabsList className="mb-6 flex flex-wrap gap-1 h-auto w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="organizations">Orgs</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="funds">Funds</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="announcements">Alerts</TabsTrigger>
            <TabsTrigger value="phone_corrections">Phone Fixes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="organizations"><OrgsTab /></TabsContent>
          <TabsContent value="volunteers"><VolunteersTab /></TabsContent>
          <TabsContent value="funds"><FundsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="news"><NewsTab /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
          <TabsContent value="phone_corrections"><PhoneCorrectionsTab /></TabsContent>
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
