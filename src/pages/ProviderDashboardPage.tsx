import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Loader2, CheckCircle, Building2, MapPin, Phone, Mail,
  MessageCircle, Shield, ExternalLink, ArrowLeft, Plus, Users,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        {myOrgs.length > 0 ? (
          myOrgs.map(({ org, role }) => (
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
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{org.physical_address}</span>
                      </div>
                    )}
                    {org.mailing_address && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span>{org.mailing_address}</span>
                      </div>
                    )}
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
                    <strong>Verification pending</strong> — contact us via WhatsApp or email to verify.
                  </div>
                )}

                <Link
                  to={`/provider/org/${org.id}/members`}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-[#1E3A5F]/30 text-[#1E3A5F] text-sm font-semibold py-2.5 hover:bg-[#1E3A5F]/5 transition"
                >
                  <Users className="w-4 h-4" />
                  View Members
                </Link>
              </CardContent>
            </Card>
          ))
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
