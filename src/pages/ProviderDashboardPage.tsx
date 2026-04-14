import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plus, Pencil, Trash2, ArrowLeft, Loader2,
  CheckCircle, MessageCircle, Building2,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tables } from "@/lib/database.types"
import { Constants } from "@/lib/database.types"

type Organization = Tables<"organizations">
type Offering = Tables<"offerings">
type AidRequest = Tables<"aid_requests">

const islandLabels: Record<string, string> = {
  guam: "Guam",
  saipan: "Saipan",
  tinian: "Tinian",
  rota: "Rota",
}

const serviceTypeLabels: Record<string, string> = {
  shelter: "Shelter",
  food: "Food",
  water: "Water",
  medical: "Medical",
  tarps: "Tarps",
  cleanup: "Cleanup",
  clothing: "Clothing",
  transportation: "Transportation",
}

const offeringStatusLabels: Record<string, string> = {
  active: "Active",
  planned: "Planned",
  at_capacity: "At Capacity",
  closed: "Closed",
}

const requestStatusColors: Record<string, string> = {
  open: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  responding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  fulfilled: "bg-green-500/20 text-green-400 border-green-500/30",
  unable: "bg-red-500/20 text-red-400 border-red-500/30",
}

const WHATSAPP_INSTRUCTIONS = `To get verified on Sinlaku Aid:

1. Save our verification number: +1 (671) 555-0100
2. Send a WhatsApp message: "VERIFY [your organization name]"
3. Include a brief description of your services
4. Our team will respond within 24 hours

Verified organizations appear with a checkmark badge,
increasing trust with aid recipients.`

type OfferingForm = {
  name: string
  location_text: string
  island: string
  service_type: string
  status: string
  hours_text: string
  capacity_text: string
  capacity_max: string
}

const defaultOfferingForm: OfferingForm = {
  name: "",
  location_text: "",
  island: "guam",
  service_type: "shelter",
  status: "active",
  hours_text: "",
  capacity_text: "",
  capacity_max: "",
}

export default function ProviderDashboardPage() {
  const { user, loading: authLoading, supabaseClient } = useAuth()
  const navigate = useNavigate()

  const [org, setOrg] = useState<Organization | null>(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgEditing, setOrgEditing] = useState(false)
  const [orgSaving, setOrgSaving] = useState(false)
  const [orgForm, setOrgForm] = useState<Partial<Organization>>({})

  const [offerings, setOfferings] = useState<Offering[]>([])
  const [offeringsLoading, setOfferingsLoading] = useState(true)

  const [requests, setRequests] = useState<AidRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  const [offeringDialog, setOfferingDialog] = useState<{
    open: boolean
    mode: "add" | "edit"
    offering?: Offering
  }>({ open: false, mode: "add" })
  const [offeringForm, setOfferingForm] = useState<OfferingForm>(defaultOfferingForm)
  const [offeringSubmitting, setOfferingSubmitting] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [verificationSaving, setVerificationSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate("/provider/register")
  }, [authLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    setOrgLoading(true)
    supabaseClient
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.warn("org fetch:", error.message)
        setOrg(data)
        setOrgLoading(false)
      })
      .catch(() => setOrgLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!org) { setOfferingsLoading(false); return }
    setOfferingsLoading(true)
    supabaseClient
      .from("offerings")
      .select("*")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.warn("offerings fetch:", error.message)
        setOfferings(data ?? [])
        setOfferingsLoading(false)
      })
      .catch(() => setOfferingsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org])

  useEffect(() => {
    setRequestsLoading(true)
    supabaseClient
      .from("aid_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.warn("requests fetch:", error.message)
        setRequests(data ?? [])
        setRequestsLoading(false)
      })
      .catch(() => setRequestsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startEditOrg = () => {
    if (!org) return
    setOrgForm({
      name: org.name,
      description: org.description ?? "",
      contact_phone: org.contact_phone,
      contact_email: org.contact_email ?? "",
      whatsapp: org.whatsapp ?? "",
    })
    setOrgEditing(true)
  }

  const saveOrg = async () => {
    if (!org) return
    setOrgSaving(true)
    const { data, error } = await supabaseClient
      .from("organizations")
      .update({
        name: orgForm.name,
        description: orgForm.description ?? null,
        contact_phone: orgForm.contact_phone ?? org.contact_phone,
        contact_email: orgForm.contact_email ?? null,
        whatsapp: orgForm.whatsapp ?? null,
      })
      .eq("id", org.id)
      .select()
      .single()
    setOrgSaving(false)
    if (error) {
      toast.error("Failed to save: " + error.message)
    } else {
      setOrg(data)
      setOrgEditing(false)
      toast.success("Organization info saved")
    }
  }

  const toggleVerification = async () => {
    if (!org) return
    setVerificationSaving(true)
    const { data, error } = await supabaseClient
      .from("organizations")
      .update({ verification_requested: !org.verification_requested })
      .eq("id", org.id)
      .select()
      .single()
    setVerificationSaving(false)
    if (error) {
      toast.error("Failed to update: " + error.message)
    } else {
      setOrg(data)
    }
  }

  const openAddOffering = () => {
    setOfferingForm(defaultOfferingForm)
    setOfferingDialog({ open: true, mode: "add" })
  }

  const openEditOffering = (o: Offering) => {
    setOfferingForm({
      name: o.name,
      location_text: o.location_text,
      island: o.island,
      service_type: o.service_type,
      status: o.status,
      hours_text: o.hours_text,
      capacity_text: o.capacity_text ?? "",
      capacity_max: o.capacity_max != null ? String(o.capacity_max) : "",
    })
    setOfferingDialog({ open: true, mode: "edit", offering: o })
  }

  const submitOffering = async () => {
    if (!org) return
    setOfferingSubmitting(true)
    const payload = {
      name: offeringForm.name,
      location_text: offeringForm.location_text,
      island: offeringForm.island as Offering["island"],
      service_type: offeringForm.service_type as Offering["service_type"],
      status: offeringForm.status as Offering["status"],
      hours_text: offeringForm.hours_text,
      capacity_text: offeringForm.capacity_text || null,
      capacity_max: offeringForm.capacity_max ? parseInt(offeringForm.capacity_max, 10) : null,
      organization_id: org.id,
    }
    if (offeringDialog.mode === "add") {
      const { data, error } = await supabaseClient.from("offerings").insert(payload).select().single()
      if (error) {
        toast.error("Failed to add: " + error.message)
      } else {
        setOfferings((prev) => [data, ...prev])
        setOfferingDialog({ open: false, mode: "add" })
        toast.success("Offering added")
      }
    } else if (offeringDialog.offering) {
      const { data, error } = await supabaseClient
        .from("offerings")
        .update(payload)
        .eq("id", offeringDialog.offering.id)
        .select()
        .single()
      if (error) {
        toast.error("Failed to update: " + error.message)
      } else {
        setOfferings((prev) => prev.map((o) => (o.id === data.id ? data : o)))
        setOfferingDialog({ open: false, mode: "add" })
        toast.success("Offering updated")
      }
    }
    setOfferingSubmitting(false)
  }

  const deleteOffering = async (id: string) => {
    const { error } = await supabaseClient.from("offerings").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete: " + error.message)
    } else {
      setOfferings((prev) => prev.filter((o) => o.id !== id))
      setDeleteConfirm(null)
      toast.success("Offering deleted")
    }
  }

  const updateRequestStatus = async (requestId: string, newStatus: AidRequest["status"]) => {
    const { data, error } = await supabaseClient
      .from("aid_requests")
      .update({ status: newStatus, responded_by: org?.id ?? null })
      .eq("id", requestId)
      .select()
      .single()
    if (error) {
      toast.error("Failed to update: " + error.message)
    } else {
      setRequests((prev) => prev.map((r) => (r.id === data.id ? data : r)))
    }
  }

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (!org) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-bold">No organization found</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          You don't have an organization registered yet. Register as a provider to
          manage offerings and respond to aid requests.
        </p>
        <Button onClick={() => navigate("/provider/register")}>Register as Provider</Button>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>Back to home</Button>
      </div>
    )
  }

  const openRequestCount = requests.filter((r) => r.status === "open").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-bold leading-tight">{org.name}</h1>
              <p className="text-xs text-muted-foreground">Provider Dashboard</p>
            </div>
          </div>
          {org.verified && (
            <Badge
              variant="outline"
              className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Org Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Info
              </CardTitle>
              {!orgEditing && (
                <Button variant="ghost" size="sm" onClick={startEditOrg}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orgEditing ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Organization Name</Label>
                    <Input
                      value={orgForm.name ?? ""}
                      onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={orgForm.contact_phone ?? ""}
                      onChange={(e) => setOrgForm((p) => ({ ...p, contact_phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={orgForm.contact_email ?? ""}
                      onChange={(e) => setOrgForm((p) => ({ ...p, contact_email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">WhatsApp Number</Label>
                    <Input
                      value={orgForm.whatsapp ?? ""}
                      onChange={(e) => setOrgForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      placeholder="+1 671 555 0000"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    value={orgForm.description ?? ""}
                    onChange={(e) => setOrgForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveOrg} disabled={orgSaving}>
                    {orgSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setOrgEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p>{org.contact_phone}</p>
                </div>
                {org.contact_email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{org.contact_email}</p>
                  </div>
                )}
                {org.whatsapp && (
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p>{org.whatsapp}</p>
                  </div>
                )}
                {org.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p>{org.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Verification Toggle */}
            {!org.verified && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Request Verification</span>
                      {org.verification_requested && (
                        <Badge
                          variant="outline"
                          className="text-xs text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
                        >
                          Pending
                        </Badge>
                      )}
                    </div>
                    {org.verification_requested ? (
                      <div className="mt-2 rounded-md bg-muted p-3 text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {WHATSAPP_INSTRUCTIONS}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Get a verified badge to build trust with aid recipients.
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={org.verification_requested}
                    onCheckedChange={toggleVerification}
                    disabled={verificationSaving}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="offerings">
          <TabsList className="grid grid-cols-2 w-full max-w-xs">
            <TabsTrigger value="offerings">Offerings</TabsTrigger>
            <TabsTrigger value="requests">
              Aid Requests
              {openRequestCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold leading-none">
                  {openRequestCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Offerings Tab */}
          <TabsContent value="offerings" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Your Offerings</h2>
              <Button size="sm" onClick={openAddOffering}>
                <Plus className="h-3 w-3 mr-1" />
                Add Offering
              </Button>
            </div>

            {offeringsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : offerings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No offerings yet.{" "}
                <button
                  onClick={openAddOffering}
                  className="text-primary underline underline-offset-2"
                >
                  Add your first offering.
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {offerings.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-lg border border-border bg-card p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{o.name}</span>
                        <Badge variant="outline" className="text-[11px]">
                          {serviceTypeLabels[o.service_type] ?? o.service_type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${
                            o.status === "active"
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : o.status === "planned"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : o.status === "at_capacity"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                          }`}
                        >
                          {offeringStatusLabels[o.status] ?? o.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {islandLabels[o.island] ?? o.island} · {o.location_text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Hours: {o.hours_text}
                        {o.capacity_text ? ` · Capacity: ${o.capacity_text}` : ""}
                        {o.capacity_max != null ? ` (max ${o.capacity_max})` : ""}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditOffering(o)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      {deleteConfirm === o.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => deleteOffering(o.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(o.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aid Requests Tab */}
          <TabsContent value="requests" className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold">Incoming Aid Requests — All Islands</h2>
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No aid requests yet.
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-medium text-sm">{r.name}</span>
                          <Badge
                            variant="outline"
                            className="text-[11px] bg-accent/30"
                          >
                            {islandLabels[r.island] ?? r.island}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] ${requestStatusColors[r.status] ?? ""}`}
                          >
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Household: {r.household_size}
                          {r.elderly_count ? ` · Elderly: ${r.elderly_count}` : ""}
                          {r.children_count ? ` · Children: ${r.children_count}` : ""}
                          {r.disabled_count ? ` · Disabled: ${r.disabled_count}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Needs: {r.needs.map((n) => serviceTypeLabels[n] ?? n).join(", ")}
                        </p>
                        {(r.mobile_phone || r.landline_phone) && (
                          <p className="text-xs text-muted-foreground">
                            Contact: {r.mobile_phone ?? r.landline_phone}
                          </p>
                        )}
                        {r.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            "{r.notes}"
                          </p>
                        )}
                      </div>
                      {r.status !== "fulfilled" && (
                        <div className="flex flex-col gap-1 shrink-0">
                          {r.status !== "responding" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-blue-400 border-blue-500/40 hover:bg-blue-500/10"
                              onClick={() => updateRequestStatus(r.id, "responding")}
                            >
                              Responding
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-green-400 border-green-500/40 hover:bg-green-500/10"
                            onClick={() => updateRequestStatus(r.id, "fulfilled")}
                          >
                            Fulfilled
                          </Button>
                          {r.status !== "unable" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-400 border-red-500/40 hover:bg-red-500/10"
                              onClick={() => updateRequestStatus(r.id, "unable")}
                            >
                              Unable
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Offering Dialog */}
      <Dialog
        open={offeringDialog.open}
        onOpenChange={(open) =>
          !open && setOfferingDialog((p) => ({ ...p, open: false }))
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {offeringDialog.mode === "add" ? "Add Offering" : "Edit Offering"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                value={offeringForm.name}
                onChange={(e) =>
                  setOfferingForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Typhoon Relief Shelter"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Island</Label>
                <Select
                  value={offeringForm.island}
                  onValueChange={(v) =>
                    setOfferingForm((p) => ({ ...p, island: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.island.map((i) => (
                      <SelectItem key={i} value={i}>
                        {islandLabels[i] ?? i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Service Type</Label>
                <Select
                  value={offeringForm.service_type}
                  onValueChange={(v) =>
                    setOfferingForm((p) => ({ ...p, service_type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.service_type.map((t) => (
                      <SelectItem key={t} value={t}>
                        {serviceTypeLabels[t] ?? t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input
                value={offeringForm.location_text}
                onChange={(e) =>
                  setOfferingForm((p) => ({ ...p, location_text: e.target.value }))
                }
                placeholder="e.g. 123 Marine Drive, Tamuning"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={offeringForm.status}
                  onValueChange={(v) =>
                    setOfferingForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Constants.public.Enums.offering_status.map((s) => (
                      <SelectItem key={s} value={s}>
                        {offeringStatusLabels[s] ?? s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Capacity</Label>
                <Input
                  type="number"
                  min={0}
                  value={offeringForm.capacity_max}
                  onChange={(e) =>
                    setOfferingForm((p) => ({ ...p, capacity_max: e.target.value }))
                  }
                  placeholder="e.g. 200"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hours</Label>
              <Input
                value={offeringForm.hours_text}
                onChange={(e) =>
                  setOfferingForm((p) => ({ ...p, hours_text: e.target.value }))
                }
                placeholder="e.g. 8am–8pm daily"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Capacity Description (optional)</Label>
              <Input
                value={offeringForm.capacity_text}
                onChange={(e) =>
                  setOfferingForm((p) => ({ ...p, capacity_text: e.target.value }))
                }
                placeholder="e.g. Cots available, families prioritized"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setOfferingDialog((p) => ({ ...p, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={submitOffering}
              disabled={
                offeringSubmitting ||
                !offeringForm.name ||
                !offeringForm.location_text ||
                !offeringForm.hours_text
              }
            >
              {offeringSubmitting && (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              )}
              {offeringDialog.mode === "add" ? "Add" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
