import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Loader2, CheckCircle, Building2, MapPin, Phone, Mail,
  MessageCircle, Shield, ExternalLink, ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Tables } from "@/lib/database.types"

type Organization = Tables<"organizations">

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

  const [org, setOrg] = useState<Organization | null>(null)
  const [orgLoading, setOrgLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) navigate("/provider/register")
  }, [authLoading, user, navigate])

  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    setOrgLoading(true)
    supabaseClient
      .from("organizations")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) console.warn("org fetch:", error.message)
        setOrg(data)
        setOrgLoading(false)
      })
      .catch(() => setOrgLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (authLoading || orgLoading) {
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

        {/* Organization Card */}
        {org ? (
          <Card className="border-2 border-[#1E3A5F]/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#1E3A5F]" />
                  <CardTitle className="text-lg text-[#1E3A5F]">{org.name}</CardTitle>
                </div>
                {org.verified ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    <Shield className="w-3 h-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {org.description && (
                <p className="text-sm text-gray-600">{org.description}</p>
              )}

              {/* Contact info */}
              <div className="space-y-2">
                {org.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{org.contact_phone}</span>
                  </div>
                )}
                {org.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{org.contact_email}</span>
                  </div>
                )}
                {org.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span>WhatsApp: {org.whatsapp}</span>
                  </div>
                )}
              </div>

              {/* Addresses */}
              {(org.mailing_address || org.physical_address) && (
                <div className="space-y-2">
                  {org.physical_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Physical Address</p>
                        <p>{org.physical_address}</p>
                      </div>
                    </div>
                  )}
                  {org.mailing_address && (
                    <div className="flex items-start gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 font-medium">Mailing Address</p>
                        <p>{org.mailing_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location coordinates */}
              {org.location_lat != null && org.location_lng != null && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {org.location_lat.toFixed(5)}, {org.location_lng.toFixed(5)}
                </div>
              )}

              {/* Islands + Services */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(org.islands as string[]).map((island) => (
                    <Badge key={island} variant="outline" className="text-xs">
                      {islandLabels[island] ?? island}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(org.service_types as string[]).map((type) => (
                    <Badge key={type} className="text-xs bg-[#1E3A5F]/10 text-[#1E3A5F] border-[#1E3A5F]/20">
                      {serviceTypeLabels[type] ?? type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Verification status */}
              {!org.verified && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Verification Pending</p>
                  <p className="text-xs">
                    Your organization is not yet verified. Contact us via WhatsApp or email
                    below to complete verification. Verified organizations appear with a
                    checkmark on the public directory.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Registered {new Date(org.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="py-8 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h2 className="text-lg font-bold text-gray-700">No Organization Registered</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                You haven't registered an organization yet. Register as a relief provider
                to appear on the directory and respond to aid requests.
              </p>
              <Button
                onClick={() => navigate("/provider/register")}
                className="text-white"
                style={{ backgroundColor: "#1E3A5F" }}
              >
                Register as Provider
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
                <li>Provide brief proof of your organization (website, social media, or government ID)</li>
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
                <ExternalLink className="w-4 h-4" />
                Contact Us on WhatsApp
              </span>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
