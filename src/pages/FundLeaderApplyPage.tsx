import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Users, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import Disclaimer from "@/components/Disclaimer"

const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}

export default function FundLeaderApplyPage() {
  const { user, supabaseClient, loading: authLoading } = useAuth()
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    organization_id: "",
    display_name: "",
    contact_phone: "",
    contact_email: "",
    address: "",
    island: "",
    intended_services: "",
  })

  // Load user's organizations
  useEffect(() => {
    if (!user || authLoading) return
    async function loadOrgs() {
      const { data } = await supabaseClient
        .from("organizations")
        .select("id, name")
        .eq("user_id", user!.id)
      setOrgs((data ?? []) as { id: string; name: string }[])
      setLoadingOrgs(false)
    }
    loadOrgs()
  }, [user, authLoading, supabaseClient])

  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email && !form.contact_email) {
      setForm(f => ({ ...f, contact_email: user.email }))
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.organization_id) return toast.error("Please select an organization.")
    if (!form.display_name.trim()) return toast.error("Contact person name is required.")
    if (!form.address.trim()) return toast.error("Physical address is required — this will be public for accountability.")
    if (!form.island) return toast.error("Please select an island.")

    setSubmitting(true)
    const { error } = await supabaseClient.from("fund_leaders").insert({
      organization_id: form.organization_id,
      clerk_user_id: user?.id ?? null,
      display_name: form.display_name.trim(),
      contact_phone: form.contact_phone.trim() || null,
      contact_email: form.contact_email.trim() || null,
      address: form.address.trim(),
      island: form.island as "guam" | "saipan" | "tinian" | "rota",
      intended_services: form.intended_services.trim() || null,
      status: "pending",
    })

    if (error) {
      console.error(error)
      toast.error("Application failed: " + error.message)
    } else {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center justify-center px-4 py-12 text-center space-y-5">
        <ShieldCheck className="w-12 h-12 text-green-600" />
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Application Submitted</h1>
        <p className="text-sm text-gray-600 max-w-sm">
          Your Fund Leader application is under review. Only <strong>admin@guahan.tech</strong> can
          approve applications. Once approved, your name, organization, and address will appear on
          the public transparency dashboard — this is the accountability that makes community trust possible.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link
            to="/transparency"
            className="bg-[#1E3A5F] text-white font-semibold text-sm px-4 py-3 rounded-lg hover:bg-[#2a4f7a] transition text-center"
          >
            View Transparency Dashboard
          </Link>
          <Link to="/" className="text-sm text-[#1E3A5F] font-semibold hover:underline">
            Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        <div className="flex items-center gap-3">
          <Link to="/how-to-help" className="text-[#1E3A5F] hover:opacity-70">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Apply as Fund Leader</h1>
        </div>

        {/* Trust explanation */}
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <Users className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
          <div className="text-sm text-green-900 space-y-1">
            <p className="font-semibold">What is a Fund Leader?</p>
            <p>
              Fund Leaders are approved organizations that receive and manage donated funds for
              relief services. Your name, organization, address, and every financial transaction
              will be <strong>publicly visible</strong> on the transparency dashboard. This
              accountability is what makes the community's trust possible.
            </p>
          </div>
        </div>

        <SignedOut>
          <Card className="border-2 border-[#1E3A5F]/20">
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-sm text-gray-600">
                You must be signed in with a registered organization to apply as a Fund Leader.
              </p>
              <SignInButton mode="modal">
                <Button className="bg-[#1E3A5F]">Sign In to Apply</Button>
              </SignInButton>
              <p className="text-xs text-muted-foreground">
                Don't have an organization yet?{" "}
                <Link to="/provider/register" className="text-[#1E3A5F] underline">Register as a provider first</Link>.
              </p>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          {loadingOrgs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : orgs.length === 0 ? (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardContent className="py-8 text-center space-y-3">
                <p className="text-sm text-amber-900">
                  You don't have any registered organizations yet. You must register an organization
                  before applying as a Fund Leader.
                </p>
                <Link
                  to="/provider/register"
                  className="inline-block bg-[#1E3A5F] text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-[#2a4f7a] transition"
                >
                  Register Organization First
                </Link>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Organization */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Organization <span className="text-destructive">*</span></Label>
                <Select value={form.organization_id} onValueChange={(v) => setForm(f => ({ ...f, organization_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select your organization" /></SelectTrigger>
                  <SelectContent>
                    {orgs.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contact person */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Contact Person Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Full name of the person managing funds"
                  value={form.display_name}
                  onChange={(e) => setForm(f => ({ ...f, display_name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">This name will be publicly visible on the transparency dashboard.</p>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Phone</Label>
                  <Input
                    type="tel"
                    placeholder="671-XXX-XXXX"
                    value={form.contact_phone}
                    onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Email</Label>
                  <Input
                    type="email"
                    placeholder="contact@org.com"
                    value={form.contact_email}
                    onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  />
                </div>
              </div>

              {/* Physical address */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Physical Address <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="Full street address on the island"
                  value={form.address}
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                />
                <p className="text-xs text-amber-700 font-medium">
                  This address will be publicly visible. This is the accountability mechanism that builds trust.
                </p>
              </div>

              {/* Island */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Island of Operation <span className="text-destructive">*</span></Label>
                <Select value={form.island} onValueChange={(v) => setForm(f => ({ ...f, island: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select island" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ISLAND_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Intended services */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Intended Use of Funds{" "}
                  <span className="text-sm font-normal text-muted-foreground">(recommended)</span>
                </Label>
                <Textarea
                  placeholder="Describe what relief services you plan to provide with allocated funds (e.g., food distribution, tarps, cleanup supplies...)"
                  value={form.intended_services}
                  onChange={(e) => setForm(f => ({ ...f, intended_services: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Disclaimer */}
              <Disclaimer />

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base bg-green-700 hover:bg-green-800"
                disabled={submitting}
              >
                {submitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : "Submit Fund Leader Application"
                }
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Applications are reviewed by <strong>admin@guahan.tech</strong>.
                Approved leaders appear on the live transparency dashboard immediately.
              </p>
            </form>
          )}
        </SignedIn>
      </div>
    </div>
  )
}
