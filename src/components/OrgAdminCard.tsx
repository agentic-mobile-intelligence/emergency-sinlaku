import { useState } from "react"
import { ShieldCheck, ShieldOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

const ISLAND_LABELS: Record<Island, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  shelter: "Shelter", food: "Food", water: "Water", medical: "Medical",
  tarps: "Tarps", cleanup: "Cleanup", clothing: "Clothing",
  transportation: "Transportation", information: "Information",
}

type Props = {
  org: OrgAdminData
  onRefetch: () => void
}

export default function OrgAdminCard({ org, onRefetch }: Props) {
  const { supabaseClient } = useAuth()
  const [updating, setUpdating] = useState(false)

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

  async function updateCategory(category: OrgCategory) {
    const { error } = await supabaseClient
      .from("organizations")
      .update({ org_category: category })
      .eq("id", org.id)
    if (error) toast.error("Category update failed: " + error.message)
    else { toast.success("Category updated."); onRefetch() }
  }

  return (
    <Card className={`border ${org.verified ? "border-green-500/30 bg-green-500/5" : org.verification_requested ? "border-yellow-500/40 bg-yellow-500/5" : ""}`}>
      <CardContent className="px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="font-semibold text-sm">{org.name}</p>
            <p className="text-xs text-muted-foreground">
              {org.contact_phone}
              {org.contact_email ? ` · ${org.contact_email}` : ""}
              {org.whatsapp ? ` · WA: ${org.whatsapp}` : ""}
            </p>
            <div className="flex flex-wrap gap-1 pt-0.5">
              <OrgBadge category={(org.org_category as OrgCategory) ?? "uncategorized"} verified={org.verified} size="sm" />
              {org.islands.map((i) => (
                <Badge key={i} variant="outline" className="text-xs">{ISLAND_LABELS[i]}</Badge>
              ))}
              {org.service_types.map((s) => (
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
        </div>
      </CardContent>
    </Card>
  )
}
