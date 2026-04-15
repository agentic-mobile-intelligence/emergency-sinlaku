import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, Building2, ArchiveRestore } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ArchivedOrg = {
  organization_id: string
  role: string
  org: { id: string; name: string; service_types: string[]; islands: string[]; created_at: string }
}

const islandLabels: Record<string, string> = { guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota" }

export default function ArchivedOrgsPage() {
  const { user, supabaseClient } = useAuth()
  const [orgs, setOrgs] = useState<ArchivedOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    supabaseClient
      .from("org_members")
      .select("organization_id, role, org:organizations(*)")
      .eq("clerk_user_id", userId)
      .then(({ data }) => {
        const archived = ((data as unknown as ArchivedOrg[]) ?? []).filter(
          (m) => (m.org as any)?.is_archived
        )
        setOrgs(archived)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function unarchive(orgId: string) {
    setRestoring(orgId)
    const { error } = await supabaseClient
      .from("organizations")
      .update({ is_archived: false })
      .eq("id", orgId)
    if (error) toast.error("Failed: " + error.message)
    else {
      toast.success("Organization restored!")
      setOrgs((prev) => prev.filter((o) => o.organization_id !== orgId))
    }
    setRestoring(null)
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/provider/dashboard" className="text-[#1E3A5F] hover:opacity-70 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Archived Organizations</h1>
        </div>

        {orgs.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500">No archived organizations.</p>
            <Link to="/provider/dashboard" className="text-sm text-[#1E3A5F] font-semibold hover:underline">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map(({ org, role, organization_id }) => (
              <Card key={organization_id} className="border border-gray-200 opacity-70">
                <CardContent className="py-4 px-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{org.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{role}</Badge>
                      {org.islands?.map((i: string) => (
                        <Badge key={i} variant="outline" className="text-xs">{islandLabels[i] ?? i}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={restoring === organization_id}
                    onClick={() => unarchive(organization_id)}
                    className="gap-1"
                  >
                    {restoring === organization_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArchiveRestore className="w-3 h-3" />}
                    Unarchive
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
