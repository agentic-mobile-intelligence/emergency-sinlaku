import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, ShieldOff, Inbox } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Island = Database["public"]["Enums"]["island"]
type ServiceType = Database["public"]["Enums"]["service_type"]
type RequestStatus = Database["public"]["Enums"]["request_status"]

const ISLANDS: Island[] = ["guam", "saipan", "tinian", "rota"]
const SERVICE_TYPES: ServiceType[] = [
  "shelter", "food", "water", "medical", "tarps", "cleanup", "clothing", "transportation",
]

const ISLAND_LABELS: Record<Island, string> = {
  guam: "Guam",
  saipan: "Saipan",
  tinian: "Tinian",
  rota: "Rota",
}

const SERVICE_LABELS: Record<ServiceType, string> = {
  shelter: "Shelter",
  food: "Food",
  water: "Water",
  medical: "Medical",
  tarps: "Tarps",
  cleanup: "Cleanup",
  clothing: "Clothing",
  transportation: "Transportation",
}

function pct(n: number, total: number) {
  if (total === 0) return 0
  return Math.round((n / total) * 100)
}

export default function AdminDashboard() {
  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ["admin", "aid_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aid_requests")
        .select("id, island, needs, status")
      if (error) throw error
      return data as { id: string; island: Island; needs: ServiceType[]; status: RequestStatus }[]
    },
  })

  const { data: orgs, isLoading: loadingOrgs } = useQuery({
    queryKey: ["admin", "organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, contact_phone, contact_email, whatsapp, islands, service_types, verified, verification_requested, created_at")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })

  // --- aggregate metrics ---
  const total = requests?.length ?? 0
  const fulfilledCount = requests?.filter((r) => r.status === "fulfilled").length ?? 0
  const pendingCount = requests?.filter((r) => r.status === "open" || r.status === "responding").length ?? 0

  const byIsland: Record<Island, number> = ISLANDS.reduce(
    (acc, island) => ({ ...acc, [island]: requests?.filter((r) => r.island === island).length ?? 0 }),
    {} as Record<Island, number>,
  )

  const byNeed: Record<ServiceType, number> = SERVICE_TYPES.reduce((acc, type) => {
    acc[type] = requests?.filter((r) => r.needs.includes(type)).length ?? 0
    return acc
  }, {} as Record<ServiceType, number>)

  const verificationQueue = orgs?.filter((o) => o.verification_requested && !o.verified) ?? []
  const verifiedOrgs = orgs?.filter((o) => o.verified) ?? []

  const isLoading = loadingRequests || loadingOrgs

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
          <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
            Typhoon Sinlaku — Admin Dashboard
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {isLoading && (
          <p className="text-muted-foreground text-sm">Loading dashboard data…</p>
        )}

        {/* ── Top-line metrics ── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Aid Request Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard
              icon={<Inbox className="h-5 w-5 text-muted-foreground" />}
              label="Total Requests"
              value={total.toString()}
            />
            <MetricCard
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              label="Fulfilled"
              value={`${pct(fulfilledCount, total)}%`}
              sub={`${fulfilledCount} of ${total}`}
            />
            <MetricCard
              icon={<Clock className="h-5 w-5 text-yellow-500" />}
              label="Pending / Active"
              value={`${pct(pendingCount, total)}%`}
              sub={`${pendingCount} of ${total}`}
            />
          </div>
        </section>

        {/* ── By island ── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Requests by Island</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ISLANDS.map((island) => (
              <Card key={island} className="border border-border">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {ISLAND_LABELS[island]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold">{byIsland[island]}</p>
                  <p className="text-xs text-muted-foreground">
                    {pct(byIsland[island], total)}% of total
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── By need type ── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Requests by Need Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICE_TYPES.map((type) => (
              <Card key={type} className="border border-border">
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {SERVICE_LABELS[type]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold">{byNeed[type]}</p>
                  <p className="text-xs text-muted-foreground">
                    {pct(byNeed[type], total)}% of requests
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Verification queue ── */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Organization Verification Queue</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {verificationQueue.length === 0
              ? "No pending verification requests."
              : `${verificationQueue.length} organization${verificationQueue.length !== 1 ? "s" : ""} awaiting verification.`}
          </p>

          {verificationQueue.length > 0 && (
            <div className="space-y-2">
              {verificationQueue.map((org) => (
                <Card key={org.id} className="border border-yellow-500/40 bg-yellow-500/5">
                  <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.contact_phone}
                        {org.contact_email ? ` · ${org.contact_email}` : ""}
                        {org.whatsapp ? ` · WA: ${org.whatsapp}` : ""}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {(org.islands as Island[]).map((i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {ISLAND_LABELS[i]}
                          </Badge>
                        ))}
                        {(org.service_types as ServiceType[]).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {SERVICE_LABELS[s]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600 shrink-0">
                      <ShieldOff className="h-4 w-4" />
                      <span className="text-xs font-medium">Pending</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {verifiedOrgs.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                {verifiedOrgs.length} verified organization{verifiedOrgs.length !== 1 ? "s" : ""}
              </summary>
              <div className="mt-2 space-y-2">
                {verifiedOrgs.map((org) => (
                  <Card key={org.id} className="border border-green-500/30 bg-green-500/5">
                    <CardContent className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.contact_phone}
                          {org.contact_email ? ` · ${org.contact_email}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600 shrink-0">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          )}
        </section>

        {/* ── Moderation queue placeholder ── */}
        <section>
          <h2 className="text-lg font-semibold mb-1">Moderation Queue</h2>
          <Card className="border border-dashed border-border">
            <CardContent className="px-4 py-8 text-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Moderation queue coming soon — flagged offerings and reported content will appear here.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card className="border border-border">
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
