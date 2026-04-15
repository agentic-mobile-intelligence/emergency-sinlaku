import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Loader2, CheckCircle, Building2, MapPin, Phone, Mail,
  MessageCircle, Shield, ExternalLink, ArrowLeft, Plus, Users,
  Pencil, Archive, MailCheck, X, Clock,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

type OrgWithRole = {
  organization_id: string
  role: string
  org: {
    id: string
    name: string
    description: string | null
    contact_phone: string | null
    contact_email: string | null
    whatsapp: string | null
    mailing_address: string | null
    physical_address: string | null
    location_lat: number | null
    location_lng: number | null
    islands: string[]
    service_types: string[]
    verified: boolean
    created_at: string
  }
}

type AllOrg = { id: string; name: string }

const islandLabels: Record<string, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}
const serviceTypeLabels: Record<string, string> = {
  shelter: "Shelter", food: "Food", water: "Water", medical: "Medical",
  tarps: "Tarps", cleanup: "Cleanup", clothing: "Clothing",
  transportation: "Transportation", information: "Information",
}

export default function ProviderDashboardPage() {
  const { user, profile, loading: authLoading, supabaseClient } = useAuth()
  const navigate = useNavigate()

  const [myOrgs, setMyOrgs] = useState<OrgWithRole[]>([])
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [editingOrg, setEditingOrg] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [editSaving, setEditSaving] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)

  // Join existing org state
  const [allOrgs, setAllOrgs] = useState<AllOrg[]>([])
  const [showJoin, setShowJoin] = useState(false)
  const [joinMode, setJoinMode] = useState<"new" | "existing">("new")
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate("/provider/register")
  }, [authLoading, user, navigate])

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    setOrgsLoading(true)
    supabaseClient
      .from("org_members")
      .select("organization_id, role, org:organizations(*)")
      .eq("clerk_user_id", userId)
      .then(({ data, error }) => {
        if (error) console.warn("orgs fetch:", error.message)
        setMyOrgs((data as unknown as OrgWithRole[]) ?? [])
        setOrgsLoading(false)
      })
      .catch(() => setOrgsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Load all orgs for the join dropdown
  useEffect(() => {
    if (!showJoin || joinMode !== "existing") return
    supabaseClient
      .from("organizations")
      .select("id, name")
      .order("name")
      .then(({ data }) => setAllOrgs((data as AllOrg[]) ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showJoin, joinMode])

  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const
  const DAY_LABELS: Record<string, string> = {
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
  }

  function startEdit(org: OrgWithRole["org"]) {
    const hours = (org as any).service_hours ?? {}
    setEditForm({
      name: org.name,
      description: org.description ?? "",
      contact_phone: org.contact_phone ?? "",
      contact_email: org.contact_email ?? "",
      whatsapp: org.whatsapp ?? "",
      physical_address: org.physical_address ?? "",
      mailing_address: org.mailing_address ?? "",
      ...Object.fromEntries(DAYS.map((d) => [`hours_${d}`, hours[d] ?? ""])),
      ...Object.fromEntries(DAYS.map((d) => [`na_${d}`, hours[d] === "N/A"])),
    })
    setEditingOrg(org.id)
  }

  async function saveEdit(orgId: string) {
    setEditSaving(true)
    const service_hours = Object.fromEntries(
      DAYS.map((d) => [d, editForm[`na_${d}`] ? "N/A" : (editForm[`hours_${d}`] || "")])
    )
    const { error } = await (supabaseClient.from("organizations") as any)
      .update({
        name: editForm.name,
        description: editForm.description || null,
        contact_phone: editForm.contact_phone || null,
        contact_email: editForm.contact_email || null,
        whatsapp: editForm.whatsapp || null,
        physical_address: editForm.physical_address || null,
        mailing_address: editForm.mailing_address || null,
        service_hours,
      })
      .eq("id", orgId)
    if (error) toast.error("Save failed: " + error.message)
    else {
      toast.success("Organization updated!")
      setEditingOrg(null)
      // Re-fetch
      const { data } = await supabaseClient
        .from("org_members")
        .select("organization_id, role, org:organizations(*)")
        .eq("clerk_user_id", userId!)
      setMyOrgs((data as unknown as OrgWithRole[]) ?? [])
    }
    setEditSaving(false)
  }

  async function archiveOrg(orgId: string) {
    if (!confirm("Archive this organization? It will be hidden from the directory and lose its verification status.")) return
    setArchiving(orgId)
    const { error } = await (supabaseClient.from("organizations") as any)
      .update({ is_archived: true, verified: false, verification_requested: false })
      .eq("id", orgId)
    if (error) toast.error("Archive failed: " + error.message)
    else {
      toast.success("Organization archived.")
      setMyOrgs((prev) => prev.filter((m) => m.organization_id !== orgId))
    }
    setArchiving(null)
  }

  function openVerifyEmail(org: OrgWithRole["org"]) {
    const islands = org.islands.map((i: string) => islandLabels[i] ?? i).join(", ")
    const services = org.service_types.map((s: string) => serviceTypeLabels[s] ?? s).join(", ")
    const subject = encodeURIComponent(`Verification Request: ${org.name}`)
    const body = encodeURIComponent(
      `Hi Guåhan.TECH,\n\nI'd like to request verification for my organization on the Sinlaku Relief Directory.\n\n` +
      `Organization: ${org.name}\n` +
      `Phone: ${org.contact_phone ?? "N/A"}\n` +
      `Email: ${org.contact_email ?? "N/A"}\n` +
      `Islands: ${islands}\n` +
      `Services: ${services}\n` +
      `Address: ${org.physical_address ?? "N/A"}\n\n` +
      `Thank you.`
    )
    window.open(`mailto:admin@guahan.tech?subject=${subject}&body=${body}`)
  }

  async function joinOrg() {
    if (!userId || !selectedOrgId) return
    setJoining(true)
    const { error } = await supabaseClient.from("org_members").insert({
      organization_id: selectedOrgId,
      clerk_user_id: userId,
      display_name: profile?.display_name ?? null,
      role: "member",
    })
    if (error) {
      if (error.code === "23505") toast.error("You're already a member of this organization.")
      else toast.error("Failed to join: " + error.message)
    } else {
      toast.success("Joined organization!")
      setShowJoin(false)
      setSelectedOrgId("")
      // Re-fetch
      const { data } = await supabaseClient
        .from("org_members")
        .select("organization_id, role, org:organizations(*)")
        .eq("clerk_user_id", userId)
      setMyOrgs((data as unknown as OrgWithRole[]) ?? [])
    }
    setJoining(false)
  }

  if (authLoading || orgsLoading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[#1E3A5F] hover:opacity-70 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1E3A5F]">Provider Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome, {profile?.display_name ?? user.email}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowJoin(!showJoin)}
            className="text-white"
            style={{ backgroundColor: "#1E3A5F" }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Org
          </Button>
        </div>

        {/* Join / Create Organization */}
        {showJoin && (
          <Card className="border-2 border-dashed border-[#1E3A5F]/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#1E3A5F]">Add Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={joinMode} onValueChange={(v) => setJoinMode(v as "new" | "existing")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create a new organization</SelectItem>
                  <SelectItem value="existing">Join an existing organization</SelectItem>
                </SelectContent>
              </Select>

              {joinMode === "new" ? (
                <Button
                  onClick={() => navigate("/provider/register")}
                  className="w-full text-white"
                  style={{ backgroundColor: "#1E3A5F" }}
                >
                  Register New Organization
                </Button>
              ) : (
                <div className="space-y-3">
                  <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allOrgs
                        .filter((o) => !myOrgs.some((m) => m.organization_id === o.id))
                        .map((o) => (
                          <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      onClick={joinOrg}
                      disabled={!selectedOrgId || joining}
                      className="flex-1 text-white"
                      style={{ backgroundColor: "#1E3A5F" }}
                    >
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Organization"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowJoin(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Organization Cards */}
        {myOrgs.filter((m) => !(m.org as any)?.is_archived).length > 0 ? (
          myOrgs
            .filter((m) => !(m.org as any)?.is_archived)
            .map(({ org, role, organization_id }) => {
              const isEditing = editingOrg === org.id
              const hours = (org as any).service_hours as Record<string, string> | null

              return (
                <Card key={org.id} className="border-2 border-[#1E3A5F]/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#1E3A5F]" />
                        <div>
                          <CardTitle className="text-lg text-[#1E3A5F]">{org.name}</CardTitle>
                          <Badge variant="outline" className="text-xs capitalize mt-0.5">{role}</Badge>
                        </div>
                      </div>
                      {org.verified ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <Shield className="w-3 h-3 mr-1" /> Unverified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Edit mode */}
                    {isEditing ? (
                      <div className="space-y-4 rounded-lg border border-[#1E3A5F]/20 p-4 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#1E3A5F]">Edit Organization</p>
                          <button onClick={() => setEditingOrg(null)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input value={editForm.name ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, name: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Description</Label>
                            <Textarea value={editForm.description ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={2} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Phone</Label>
                              <Input value={editForm.contact_phone ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, contact_phone: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Email</Label>
                              <Input value={editForm.contact_email ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, contact_email: e.target.value }))} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">WhatsApp</Label>
                            <Input value={editForm.whatsapp ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, whatsapp: e.target.value }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Physical Address</Label>
                              <Input value={editForm.physical_address ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, physical_address: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Mailing Address</Label>
                              <Input value={editForm.mailing_address ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, mailing_address: e.target.value }))} />
                            </div>
                          </div>

                          {/* Service Hours */}
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold">Service Hours</Label>
                            <div className="space-y-1.5">
                              {DAYS.map((d) => (
                                <div key={d} className="flex items-center gap-2">
                                  <span className="text-xs font-medium w-8 text-gray-600">{DAY_LABELS[d]}</span>
                                  <Input
                                    className={`h-8 text-xs flex-1 ${editForm[`na_${d}`] ? "opacity-40" : ""}`}
                                    value={editForm[`na_${d}`] ? "" : (editForm[`hours_${d}`] ?? "")}
                                    onChange={(e) => setEditForm((p: any) => ({ ...p, [`hours_${d}`]: e.target.value }))}
                                    disabled={editForm[`na_${d}`]}
                                    placeholder="e.g. 9am - 5pm"
                                  />
                                  <div className="flex items-center gap-1">
                                    <Switch
                                      checked={!editForm[`na_${d}`]}
                                      onCheckedChange={(v) => setEditForm((p: any) => ({
                                        ...p,
                                        [`na_${d}`]: !v,
                                        ...(v ? {} : { [`hours_${d}`]: "" }),
                                      }))}
                                    />
                                    <span className="text-xs text-gray-400 w-6">{editForm[`na_${d}`] ? "N/A" : ""}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveEdit(org.id)}
                            disabled={editSaving}
                            className="flex-1 text-white"
                            style={{ backgroundColor: "#1E3A5F" }}
                          >
                            {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={() => setEditingOrg(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {org.description && <p className="text-sm text-gray-600">{org.description}</p>}

                        <div className="space-y-2">
                          {org.contact_phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" /><span>{org.contact_phone}</span>
                            </div>
                          )}
                          {org.contact_email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" /><span>{org.contact_email}</span>
                            </div>
                          )}
                          {org.whatsapp && (
                            <div className="flex items-center gap-2 text-sm">
                              <MessageCircle className="w-4 h-4 text-gray-400" /><span>WhatsApp: {org.whatsapp}</span>
                            </div>
                          )}
                        </div>

                        {(org.physical_address || org.mailing_address) && (
                          <div className="space-y-1 text-sm">
                            {org.physical_address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><span>{org.physical_address}</span>
                              </div>
                            )}
                            {org.mailing_address && (
                              <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 text-gray-400 mt-0.5" /><span>{org.mailing_address}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Service Hours */}
                        {hours && Object.values(hours).some((v) => v && v !== "N/A") && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Service Hours
                            </p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                              {DAYS.map((d) => (
                                <div key={d} className={`flex justify-between ${hours[d] === "N/A" ? "text-gray-300" : "text-gray-600"}`}>
                                  <span className="font-medium">{DAY_LABELS[d]}</span>
                                  <span>{hours[d] || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          {org.islands.map((island: string) => (
                            <Badge key={island} variant="outline" className="text-xs">
                              {islandLabels[island] ?? island}
                            </Badge>
                          ))}
                          {org.service_types.map((type: string) => (
                            <Badge key={type} className="text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20">
                              {serviceTypeLabels[type] ?? type}
                            </Badge>
                          ))}
                        </div>

                        {!org.verified && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                            <strong>Verification pending</strong> — request verification below or contact us.
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/provider/org/${org.id}/members`}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1E3A5F]/30 text-[#1E3A5F] text-xs font-semibold py-2 hover:bg-[#1E3A5F]/5 transition"
                        >
                          <Users className="w-3.5 h-3.5" /> Members
                        </Link>
                        <button
                          onClick={() => startEdit(org)}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-[#1E3A5F]/30 text-[#1E3A5F] text-xs font-semibold py-2 hover:bg-[#1E3A5F]/5 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        {!org.verified && (
                          <button
                            onClick={() => openVerifyEmail(org)}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-green-300 text-green-700 text-xs font-semibold py-2 hover:bg-green-50 transition"
                          >
                            <MailCheck className="w-3.5 h-3.5" /> Request Verification
                          </button>
                        )}
                        <button
                          onClick={() => archiveOrg(org.id)}
                          disabled={archiving === org.id}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold py-2 hover:bg-red-50 transition"
                        >
                          {archiving === org.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                          Archive
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="py-8 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h2 className="text-lg font-bold text-gray-700">No Organizations Yet</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Create a new organization or join an existing one to get started.
              </p>
              <Button
                onClick={() => setShowJoin(true)}
                className="text-white"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Organization
              </Button>
            </CardContent>
          </Card>
        )}

        {/* View Archived link */}
        <div className="text-center">
          <Link to="/provider/archived" className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
            View Archived Organizations
          </Link>
        </div>

        {/* Help / Contact CTA */}
        <Card className="border border-[#1E3A5F]/20 bg-[#1E3A5F]/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#1E3A5F]">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Contact <strong>Guåhan.TECH</strong> for help with registration, verification,
              or any questions about the relief directory.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://wa.me/16716887638"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 hover:bg-green-100 transition"
              >
                <MessageCircle className="w-5 h-5 text-green-700" />
                <div>
                  <p className="text-sm font-semibold text-green-800">WhatsApp</p>
                  <p className="text-xs text-green-600">+1 671 688 7638</p>
                </div>
              </a>
              <a
                href="mailto:admin@guahan.tech"
                className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 hover:bg-blue-100 transition"
              >
                <Mail className="w-5 h-5 text-blue-700" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Email</p>
                  <p className="text-xs text-blue-600">admin@guahan.tech</p>
                </div>
              </a>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
              <p className="text-sm font-semibold text-[#1E3A5F]">How to Get Verified</p>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Register your organization through the provider sign-up form</li>
                <li>Message us on WhatsApp or email with your organization name</li>
                <li>Provide brief proof (website, social media, or government ID)</li>
                <li>We'll verify your listing within 24 hours</li>
              </ol>
            </div>
            <a
              href="https://wa.me/16716887638?text=Hi%2C%20I%20need%20help%20with%20my%20provider%20registration%20on%20Sinlaku%20Relief%20Directory"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg py-3 hover:bg-[#2a4f7a] transition"
            >
              <span className="flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" /> Contact Us on WhatsApp
              </span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
