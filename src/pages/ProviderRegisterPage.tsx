import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, Loader2, CheckCircle2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
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

// ── Step 1: Auth ──────────────────────────────────────────────────────────────

interface AuthStepProps {
  onAuth: () => void
  signUp: (email: string, password: string, displayName: string) => Promise<unknown>
  signIn: (email: string, password: string) => Promise<unknown>
}

function AuthStep({ onAuth, signUp, signIn }: AuthStepProps) {
  const [mode, setMode] = useState<"signup" | "signin">("signup")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName || email.split("@")[0])
      } else {
        await signIn(email, password)
      }
      onAuth()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
          {mode === "signup" ? "Create your provider account" : "Sign in to your account"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signup"
            ? "First, create an account. Then you'll fill in your organization details."
            : "Sign in to continue with your provider registration."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Your name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full text-white"
          style={{ backgroundColor: "#1E3A5F" }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : mode === "signup" ? (
            "Create Account & Continue"
          ) : (
            "Sign In & Continue"
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError("") }}
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
  contact_phone: string
  contact_email: string
  whatsapp: string
  service_types: ServiceType[]
  islands: Island[]
}

interface OrgStepProps {
  userId: string
  onDone: () => void
}

function OrgStep({ userId, onDone }: OrgStepProps) {
  const [form, setForm] = useState<OrgFormData>({
    name: "",
    description: "",
    contact_phone: "",
    contact_email: "",
    whatsapp: "",
    service_types: [],
    islands: [],
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
    if (!form.contact_phone.trim()) {
      setError("Contact phone is required.")
      return
    }

    setLoading(true)
    try {
      // Insert organization
      const { error: orgError } = await supabase.from("organizations").insert({
        user_id: userId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        contact_phone: form.contact_phone.trim(),
        contact_email: form.contact_email.trim() || null,
        whatsapp: form.whatsapp.trim() || null,
        service_types: form.service_types,
        islands: form.islands,
        verified: false,
        verification_requested: false,
      })

      if (orgError) throw orgError

      // Update profile role to 'provider'
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "provider" })
        .eq("id", userId)

      if (profileError) throw profileError

      toast.success("Registration submitted! Welcome to the network.")
      onDone()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold" style={{ color: "#1E3A5F" }}>
          Register your organization
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about the relief services you're providing.
        </p>
      </div>

      {/* Organization name */}
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

      {/* Description */}
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

      {/* Contact phone */}
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

      {/* Contact email */}
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

      {/* WhatsApp */}
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

      {/* Service types */}
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

      {/* Islands */}
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

      {/* Verification note */}
      <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 flex gap-3 text-sm text-amber-800">
        <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <p>
          All providers start <strong>unverified</strong>. To verify your organization, contact us
          via WhatsApp for manual verification.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
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
  const { user, loading: authLoading, signUp, signIn } = useAuth()

  // Determine which step to show
  const [step, setStep] = useState<"auth" | "org" | "done">("auth")

  useEffect(() => {
    if (!authLoading && user) {
      setStep("org")
    }
  }, [authLoading, user])

  const handleAuthDone = () => {
    setStep("org")
  }

  const handleOrgDone = () => {
    setStep("done")
    navigate("/provider/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-lg">
          {/* Page title */}
          <div className="mb-8 text-center space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Provider Portal
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Register as a Relief Provider</h1>
          </div>

          {/* Step indicator */}
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

          {/* Card */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {authLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : step === "auth" ? (
              <AuthStep onAuth={handleAuthDone} signUp={signUp} signIn={signIn} />
            ) : step === "org" && user ? (
              <OrgStep userId={user.id} onDone={handleOrgDone} />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
