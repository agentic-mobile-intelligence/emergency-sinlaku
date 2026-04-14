import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Loader2, CheckCircle2, MessageCircle, FlaskConical, MapPin } from "lucide-react"
import { useSignUp, useSignIn, useUser } from "@clerk/clerk-react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import type { Enums } from "@/lib/database.types"

type ServiceType = Enums<"service_type">
type Island = Enums<"island">

const SERVICE_TYPE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "shelter", label: "Shelter" },
  { value: "food", label: "Food" },
  { value: "water", label: "Water" },
  { value: "medical", label: "Medical" },
  { value: "tarps", label: "Tarps" },
  { value: "cleanup", label: "Cleanup" },
  { value: "clothing", label: "Clothing" },
  { value: "transportation", label: "Transportation" },
]

const ISLAND_OPTIONS: { value: Island; label: string }[] = [
  { value: "guam", label: "Guam" },
  { value: "saipan", label: "Saipan" },
  { value: "tinian", label: "Tinian" },
  { value: "rota", label: "Rota" },
]

// ── Dev sandbox fixtures ──────────────────────────────────────────────────────

const DEV = import.meta.env.DEV

const DEV_ORG = {
  id: "00000000-0000-0000-0001-000000000001",
  name: "Guam Red Cross Emergency Shelter [SANDBOX]",
  description: "[SANDBOX] Red Cross emergency shelter and feeding — Typhoon Sinlaku.",
  mailing_address: "P.O. Box 2950, Hagåtña, Guam 96932",
  physical_address: "221 Chalan Santo Papa, Hagåtña, Guam 96910",
  location_lat: 13.4745,
  location_lng: 144.7504,
  contact_phone: "671-472-7234",
  contact_email: "sandbox@sinlaku.directory.gu",
  whatsapp: "+16714727234",
  service_types: ["shelter", "food"] as ServiceType[],
  islands: ["guam"] as Island[],
}

// ── Map pin picker ───────────────────────────────────────────────────────────

const PIN_ICON = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const GUAM_CENTER: [number, number] = [13.4443, 144.7937]

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) })
  return null
}

function LocationPicker({ lat, lng, onChange }: {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}) {
  const position = useMemo(
    () => (lat != null && lng != null ? [lat, lng] as [number, number] : null),
    [lat, lng],
  )

  return (
    <MapContainer center={position ?? GUAM_CENTER} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onChange} />
      {position && <Marker position={position} icon={PIN_ICON} />}
    </MapContainer>
  )
}

// ── Step 1: Auth (custom Clerk hooks) ────────────────────────────────────────

function AuthStep() {
  const [mode, setMode] = useState<"signup" | "signin">("signup")
  const [signupStage, setSignupStage] = useState<"form" | "verify">("form")

  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const reset = () => {
    setEmail("")
    setPassword("")
    setCode("")
    setError("")
    setLoading(false)
    setSignupStage("form")
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded) return
    setError("")
    setLoading(true)
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setSignupStage("verify")
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Sign up failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded) return
    setError("")
    setLoading(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId })
        // parent useEffect watches useUser and advances to org step
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded) return
    setError("")
    setLoading(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId })
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage ?? err?.errors?.[0]?.message ?? "Sign in failed.")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    reset()
    setMode(mode === "signup" ? "signin" : "signup")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
          {mode === "signup"
            ? signupStage === "verify" ? "Check your email" : "Create your provider account"
            : "Sign in to your account"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signup"
            ? signupStage === "verify"
              ? `We sent a verification code to ${email}. Enter it below.`
              : "First, create an account. Then you'll fill in your organization details."
            : "Sign in to continue with your provider registration."}
        </p>
      </div>

      {mode === "signup" && signupStage === "form" && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="su-email">Email</Label>
            <Input
              id="su-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="su-password">Password</Label>
            <Input
              id="su-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={loading || !signUpLoaded} className="w-full text-white" style={{ backgroundColor: "#1E3A5F" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>
      )}

      {mode === "signup" && signupStage === "verify" && (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="verify-code">Verification code</Label>
            <Input
              id="verify-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={loading || !signUpLoaded} className="w-full text-white" style={{ backgroundColor: "#1E3A5F" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
          </Button>
          <button type="button" onClick={() => setSignupStage("form")} className="text-sm text-muted-foreground hover:underline w-full text-center">
            Back
          </button>
        </form>
      )}

      {mode === "signin" && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="si-email">Email</Label>
            <Input
              id="si-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="si-password">Password</Label>
            <Input
              id="si-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button type="submit" disabled={loading || !signInLoaded} className="w-full text-white" style={{ backgroundColor: "#1E3A5F" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={switchMode}
        className="text-sm text-muted-foreground hover:underline w-full text-center"
      >
        {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>
    </div>
  )
}

// ── Step 2: Organization form ─────────────────────────────────────────────────

interface OrgFormData {
  name: string
  description: string
  mailing_address: string
  physical_address: string
  location_lat: number | null
  location_lng: number | null
  contact_phone: string
  contact_email: string
  whatsapp: string
  service_types: ServiceType[]
  islands: Island[]
}

interface OrgStepProps {
  userId: string
  onDone: () => void
  onError: (msg: string) => void
}

function OrgStep({ userId, onDone, onError }: OrgStepProps) {
  const { supabaseClient } = useAuth()
  const [form, setForm] = useState<OrgFormData>({
    name: DEV ? DEV_ORG.name : "",
    description: DEV ? DEV_ORG.description : "",
    mailing_address: DEV ? DEV_ORG.mailing_address : "",
    physical_address: DEV ? DEV_ORG.physical_address : "",
    location_lat: DEV ? DEV_ORG.location_lat : null,
    location_lng: DEV ? DEV_ORG.location_lng : null,
    contact_phone: DEV ? DEV_ORG.contact_phone : "",
    contact_email: DEV ? DEV_ORG.contact_email : "",
    whatsapp: DEV ? DEV_ORG.whatsapp : "",
    service_types: DEV ? DEV_ORG.service_types : [],
    islands: DEV ? DEV_ORG.islands : [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleServiceType = (value: ServiceType) => {
    setForm((prev) => ({
      ...prev,
      service_types: prev.service_types.includes(value)
        ? prev.service_types.filter((s) => s !== value)
        : [...prev.service_types, value],
    }))
  }

  const toggleIsland = (value: Island) => {
    setForm((prev) => ({
      ...prev,
      islands: prev.islands.includes(value)
        ? prev.islands.filter((i) => i !== value)
        : [...prev.islands, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.name.trim()) {
      setError("Organization name is required.")
      return
    }
    if (!form.mailing_address.trim()) {
      setError("Mailing address is required.")
      return
    }
    if (!form.physical_address.trim()) {
      setError("Physical address is required.")
      return
    }
    if (!form.contact_phone.trim()) {
      setError("Contact phone is required.")
      return
    }

    setLoading(true)
    try {
      if (DEV) {
        // Dev: upsert with fixed id — idempotent, safe to repeat
        const { error: orgError } = await supabaseClient.from("organizations").upsert({
          id: DEV_ORG.id,
          user_id: userId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          mailing_address: form.mailing_address.trim(),
          physical_address: form.physical_address.trim(),
          location_lat: form.location_lat,
          location_lng: form.location_lng,
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          service_types: form.service_types,
          islands: form.islands,
          verified: false,
          verification_requested: false,
        }, { onConflict: "id" })
        if (orgError) throw orgError
      } else {
        const { error: orgError } = await supabaseClient.from("organizations").insert({
          user_id: userId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          mailing_address: form.mailing_address.trim(),
          physical_address: form.physical_address.trim(),
          location_lat: form.location_lat,
          location_lng: form.location_lng,
          contact_phone: form.contact_phone.trim(),
          contact_email: form.contact_email.trim() || null,
          whatsapp: form.whatsapp.trim() || null,
          service_types: form.service_types,
          islands: form.islands,
          verified: false,
          verification_requested: false,
        })
        if (orgError) throw orgError
      }

      // Upsert profile with Clerk user ID as the identifier.
      // clerk_user_id and role columns are added by migration 20260413190000.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabaseClient.from("profiles") as any).upsert({
        id: crypto.randomUUID(),
        clerk_user_id: userId,
        display_name: "Provider",
        role: "provider",
      }, { onConflict: "clerk_user_id" })

      toast.success("Registration submitted! Welcome to the network.")
      onDone()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again."
      setError(msg)
      toast.error(msg)
      onError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {DEV && (
        <div data-testid="dev-org-banner" className="flex items-center gap-2 rounded-md bg-violet-50 border border-violet-200 px-3 py-2 text-xs text-violet-700 font-medium">
          <FlaskConical className="w-3.5 h-3.5 shrink-0" />
          DEV — Org form pre-filled with sandbox data
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
          Register your organization
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about the relief services you're providing.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-name">
          Organization name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="org-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          placeholder="e.g. Guam Red Cross Chapter"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-description">Description</Label>
        <Textarea
          id="org-description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Briefly describe your organization and the relief services you offer."
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-mailing-address">
          Mailing address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="org-mailing-address"
          type="text"
          value={form.mailing_address}
          onChange={(e) => setForm((p) => ({ ...p, mailing_address: e.target.value }))}
          required
          placeholder="P.O. Box 2950, Hagåtña, Guam 96932"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-physical-address">
          Physical address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="org-physical-address"
          type="text"
          value={form.physical_address}
          onChange={(e) => setForm((p) => ({ ...p, physical_address: e.target.value }))}
          required
          placeholder="221 Chalan Santo Papa, Hagåtña, Guam 96910"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Pin your location on the map <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Click the map to set your organization's location.</p>
        <div className="rounded-md border border-border overflow-hidden" style={{ height: 260 }}>
          <LocationPicker
            lat={form.location_lat}
            lng={form.location_lng}
            onChange={(lat, lng) => setForm((p) => ({ ...p, location_lat: lat, location_lng: lng }))}
          />
        </div>
        {form.location_lat != null && form.location_lng != null && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {form.location_lat.toFixed(5)}, {form.location_lng.toFixed(5)}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-phone">
          Contact phone <span className="text-destructive">*</span>
        </Label>
        <Input
          id="org-phone"
          type="tel"
          value={form.contact_phone}
          onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))}
          required
          placeholder="+1 671 555-0100"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-email">Contact email</Label>
        <Input
          id="org-email"
          type="email"
          value={form.contact_email}
          onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
          placeholder="contact@yourorg.org"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="org-whatsapp">WhatsApp number</Label>
        <Input
          id="org-whatsapp"
          type="tel"
          value={form.whatsapp}
          onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
          placeholder="+1 671 555-0100"
        />
      </div>

      <div className="space-y-3">
        <Label>Services offered</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SERVICE_TYPE_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Checkbox
                checked={form.service_types.includes(value)}
                onCheckedChange={() => toggleServiceType(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Islands served</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ISLAND_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Checkbox
                checked={form.islands.includes(value)}
                onCheckedChange={() => toggleIsland(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 text-sm text-amber-800">
        <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <p>
          All providers start <strong>unverified</strong>. To verify your organization, contact us
          via WhatsApp for manual verification.
        </p>
      </div>

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-destructive text-destructive hover:bg-destructive hover:text-white"
            onClick={() => onError(error)}
          >
            Get help registering →
          </Button>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full text-white"
        style={{ backgroundColor: "#1E3A5F" }}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          "Submit Registration"
        )}
      </Button>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProviderRegisterPage() {
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const [step, setStep] = useState<"auth" | "org" | "done">("auth")

  // Advance to org step once Clerk reports user is signed in
  useEffect(() => {
    if (!isLoaded) return
    if (user) {
      setStep((prev) => prev === "auth" ? "org" : prev)
    } else {
      setStep("auth")
    }
  }, [isLoaded, user])

  const handleOrgDone = () => {
    setStep("done")
    navigate("/provider/dashboard")
  }

  const handleOrgError = (msg: string) => {
    navigate("/provider/register/failed", { state: { error: msg } })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
              Typhoon Sinlaku Relief
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Provider Portal
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Register as a Relief Provider</h1>
          </div>

          {step !== "done" && (
            <div className="flex items-center gap-2 mb-8">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: step === "auth" ? "#1E3A5F" : "#16A34A" }}
              >
                {step === "auth" ? "1" : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className={`text-sm font-medium ${step === "auth" ? "text-foreground" : "text-muted-foreground"}`}>
                Account
              </span>
              <div className="flex-1 h-px bg-border mx-1" />
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                style={{
                  backgroundColor: step === "org" ? "#1E3A5F" : "#e5e7eb",
                  color: step === "org" ? "#fff" : "#9ca3af",
                }}
              >
                2
              </div>
              <span className={`text-sm font-medium ${step === "org" ? "text-foreground" : "text-muted-foreground"}`}>
                Organization
              </span>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {!isLoaded ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : step === "auth" ? (
              <AuthStep />
            ) : step === "org" && user ? (
              <OrgStep userId={user.id} onDone={handleOrgDone} onError={handleOrgError} />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
