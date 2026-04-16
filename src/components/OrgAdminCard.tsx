import { useState } from "react"
import { ShieldCheck, ShieldOff, Loader2, Pencil, ChevronDown, ChevronUp, Check, X, EyeOff, Eye } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import OrgBadge from "@/components/OrgBadge"
import { useAuth } from "@/hooks/useAuth"
import type { Database } from "@/lib/database.types"

type Island = Database["public"]["Enums"]["island"]
type ServiceType = Database["public"]["Enums"]["service_type"]
type OrgCategory = Database["public"]["Enums"]["org_category"]

export type OrgAdminData = {
  id: string
  name: string
  contact_phone: string
  contact_email: string | null
  whatsapp?: string | null
  islands: Island[]
  service_types: ServiceType[]
  verified: boolean
  verification_requested: boolean
  org_category: OrgCategory | null
  hidden_from_map: boolean
}

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

type EditForm = {
  name: string
  contact_phone: string
  contact_email: string
  whatsapp: string
  islands: Island[]
  service_types: ServiceType[]
}

type Props = {
  org: OrgAdminData
  onRefetch: () => void
}

export default function OrgAdminCard({ org, onRefetch }: Props) {
  const { supabaseClient } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    name: org.name,
    contact_phone: org.contact_phone,
    contact_email: org.contact_email ?? "",
    whatsapp: org.whatsapp ?? "",
    islands: [...org.islands],
    service_types: [...org.service_types],
  })

  function openEdit() {
    setEditForm({
      name: org.name,
      contact_phone: org.contact_phone,
      contact_email: org.contact_email ?? "",
      whatsapp: org.whatsapp ?? "",
      islands: [...org.islands],
      service_types: [...org.service_types],
    })
    setEditing(true)
  }

  function toggleIsland(island: Island) {
    setEditForm((prev) => ({
      ...prev,
      islands: prev.islands.includes(island)
        ? prev.islands.filter((i) => i !== island)
        : [...prev.islands, island],
    }))
  }

  function toggleServiceType(type: ServiceType) {
    setEditForm((prev) => ({
      ...prev,
      service_types: prev.service_types.includes(type)
        ? prev.service_types.filter((t) => t !== type)
        : [...prev.service_types, type],
    }))
  }

  async function toggleVerified() {
    setUpdating(true)
    const { error } = await supabaseClient
      .from("organizations")
      .update({ verified: !org.verified, verification_requested: org.verified ? false : true })
      .eq("id", org.id)
    if (error) toast.error("Update failed: " + error.message)
    else { toast.success(org.verified ? "Org unverified." : "Org verified!"); onRefetch() }
    setUpdating(false)
  }

  async function toggleHiddenFromMap() {
    const { error } = await supabaseClient
      .from("organizations")
      .update({ hidden_from_map: !org.hidden_from_map })
      .eq("id", org.id)
    if (error) toast.error("Update failed: " + error.message)
    else { toast.success(org.hidden_from_map ? "Org visible on map." : "Org hidden from map."); onRefetch() }
  }

  async function updateCategory(category: OrgCategory) {
    const { error } = await supabaseClient
      .from("organizations")
      .update({ org_category: category })
      .eq("id", org.id)
    if (error) toast.error("Category update failed: " + error.message)
    else { toast.success("Category updated."); onRefetch() }
  }

  async function saveEdit() {
    if (!editForm.name.trim()) return toast.error("Name is required.")
    if (!editForm.contact_phone.trim()) return toast.error("Phone is required.")
    setSaving(true)
    const { error } = await supabaseClient
      .from("organizations")
      .update({
        name: editForm.name.trim(),
        contact_phone: editForm.contact_phone.trim(),
        contact_email: editForm.contact_email.trim() || null,
        whatsapp: editForm.whatsapp.trim() || null,
        islands: editForm.islands,
        service_types: editForm.service_types,
      })
      .eq("id", org.id)
    if (error) toast.error("Save failed: " + error.message)
    else { toast.success("Changes saved."); setEditing(false); onRefetch() }
    setSaving(false)
  }

  return (
    <Card className={`border ${org.verified ? "border-green-500/30 bg-green-500/5" : org.verification_requested ? "border-yellow-500/40 bg-yellow-500/5" : ""}`}>
      <CardContent className="px-4 py-3 space-y-2">

        {/* Header — always visible */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="font-semibold text-sm">{org.name}</p>
            <p className="text-xs text-muted-foreground">
              {org.contact_phone}
              {org.contact_email ? ` · ${org.contact_email}` : ""}
              {org.whatsapp ? ` · WA: ${org.whatsapp}` : ""}
            </p>
            {!collapsed && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                <OrgBadge category={(org.org_category as OrgCategory) ?? "uncategorized"} verified={org.verified} size="sm" />
                {org.islands.map((i) => (
                  <Badge key={i} variant="outline" className="text-xs">{ISLAND_LABELS[i]}</Badge>
                ))}
                {org.service_types.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{SERVICE_LABELS[s]}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {org.verified
              ? <><ShieldCheck className="h-4 w-4 text-green-600" /><span className="text-xs text-green-600 font-medium">Verified</span></>
              : org.verification_requested
                ? <><ShieldOff className="h-4 w-4 text-yellow-600" /><span className="text-xs text-yellow-600 font-medium">Pending</span></>
                : <><ShieldOff className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Unverified</span></>
            }
            <button
              onClick={() => { setCollapsed(!collapsed); setEditing(false) }}
              className="text-muted-foreground hover:text-foreground transition ml-1"
              title={collapsed ? "Show" : "Hide"}
            >
              {collapsed
                ? <ChevronDown className="h-4 w-4" />
                : <ChevronUp className="h-4 w-4" />
              }
            </button>
          </div>
        </div>

        {/* Collapsible content */}
        {!collapsed && (
          <>
            {/* Actions row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={(org.org_category as OrgCategory) ?? "uncategorized"}
                onValueChange={(v) => updateCategory(v as OrgCategory)}
              >
                <SelectTrigger className="h-7 text-xs w-52">
                  <SelectValue placeholder="Set category…" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant={org.verified ? "outline" : "default"}
                className={org.verified ? "h-7 text-xs" : "h-7 text-xs bg-[#1E3A5F]"}
                disabled={updating}
                onClick={toggleVerified}
              >
                {updating
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : org.verified ? "Unverify" : "Verify ✓"
                }
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={editing ? () => setEditing(false) : openEdit}
              >
                {editing
                  ? <><X className="h-3 w-3 mr-1" />Cancel</>
                  : <><Pencil className="h-3 w-3 mr-1" />Edit</>
                }
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={`h-7 text-xs ${org.hidden_from_map ? "border-orange-400 text-orange-600 hover:bg-orange-50" : "text-muted-foreground"}`}
                onClick={toggleHiddenFromMap}
                title={org.hidden_from_map ? "Show on map" : "Hide from map"}
              >
                {org.hidden_from_map
                  ? <><EyeOff className="h-3 w-3 mr-1" />Hidden from map</>
                  : <><Eye className="h-3 w-3 mr-1" />Hide from map</>
                }
              </Button>
            </div>

            {/* Inline edit form */}
            {editing && (
              <div className="mt-1 rounded-lg border border-blue-200 bg-blue-50/40 p-3 space-y-3">
                <p className="text-xs font-semibold text-[#1E3A5F]">Edit Organization</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone <span className="text-destructive">*</span></Label>
                    <Input
                      type="tel"
                      value={editForm.contact_phone}
                      onChange={(e) => setEditForm((p) => ({ ...p, contact_phone: e.target.value }))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input
                      type="email"
                      value={editForm.contact_email}
                      onChange={(e) => setEditForm((p) => ({ ...p, contact_email: e.target.value }))}
                      className="h-7 text-xs"
                      placeholder="optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">WhatsApp</Label>
                    <Input
                      type="tel"
                      value={editForm.whatsapp}
                      onChange={(e) => setEditForm((p) => ({ ...p, whatsapp: e.target.value }))}
                      className="h-7 text-xs"
                      placeholder="optional"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs block mb-1.5">Islands</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {ISLANDS.map((island) => (
                      <button
                        key={island}
                        type="button"
                        onClick={() => toggleIsland(island)}
                        className={`text-xs px-2.5 py-0.5 rounded-full border transition ${
                          editForm.islands.includes(island)
                            ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                            : "border-gray-300 text-gray-500 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                        }`}
                      >
                        {ISLAND_LABELS[island]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs block mb-1.5">Service Types</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {SERVICE_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleServiceType(type)}
                        className={`text-xs px-2.5 py-0.5 rounded-full border transition ${
                          editForm.service_types.includes(type)
                            ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                            : "border-gray-300 text-gray-500 hover:border-[#1E3A5F] hover:text-[#1E3A5F]"
                        }`}
                      >
                        {SERVICE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={saveEdit}
                    disabled={saving}
                    className="h-7 text-xs bg-[#1E3A5F]"
                  >
                    {saving
                      ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      : <Check className="h-3 w-3 mr-1" />
                    }
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
