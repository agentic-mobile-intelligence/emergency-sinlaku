import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

export default function AnonymousSupportPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    island: "" as Island | "",
    service_types: [] as ServiceType[],
    location: "",
    phone: "",
    hours: "",
    description: "",
  })

  const toggleServiceType = (value: ServiceType) => {
    setForm((prev) => ({
      ...prev,
      service_types: prev.service_types.includes(value)
        ? prev.service_types.filter((s) => s !== value)
        : [...prev.service_types, value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.island) { setError("Please select an island."); return }
    if (form.service_types.length === 0) { setError("Please select at least one service type."); return }
    if (!form.location.trim()) { setError("Location is required."); return }
    if (!form.description.trim()) { setError("Description is required."); return }

    setLoading(true)
    try {
      const { error: insertErr } = await supabase.from("aid_requests").insert({
        name: form.name.trim() || "Anonymous",
        island: form.island as Island,
        needs: form.service_types,
        notes: [
          form.description.trim(),
          form.location.trim() ? `Location: ${form.location.trim()}` : null,
          form.phone.trim() ? `Contact: ${form.phone.trim()}` : null,
          form.hours.trim() ? `Hours: ${form.hours.trim()}` : null,
          "[ANONYMOUS SUPPORT SUBMISSION — pending manual approval]",
        ].filter(Boolean).join("\n\n"),
        household_size: 1,
        mobile_phone: form.phone.trim() || null,
        no_contact_explanation: form.phone.trim() ? null : "Anonymous submission — no contact provided",
      })

      if (insertErr) throw insertErr
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4" data-testid="anonymous-success">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold">Submission received</h2>
          <p className="text-sm text-muted-foreground">
            Our team will review your submission and manually add your service to the directory.
            Thank you for helping the community.
          </p>
          <Button variant="outline" onClick={() => navigate("/")} className="mt-2">
            Back to directory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center">
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
              Anonymous Submission
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Add a service to the directory</h1>
            <p className="text-sm text-muted-foreground pt-1">
              No account needed. Our team will review and manually approve your listing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">

            <div className="space-y-1.5">
              <Label htmlFor="anon-name">Your name (optional)</Label>
              <Input
                id="anon-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Leave blank to stay anonymous"
              />
            </div>

            <div className="space-y-3">
              <Label>Island <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                {ISLAND_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${
                      form.island === value
                        ? "border-[#1E3A5F] bg-[#1E3A5F]/5 font-medium"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="island"
                      value={value}
                      checked={form.island === value}
                      onChange={() => setForm((p) => ({ ...p, island: value }))}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Service type(s) <span className="text-destructive">*</span></Label>
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

            <div className="space-y-1.5">
              <Label htmlFor="anon-location">Location / address <span className="text-destructive">*</span></Label>
              <Input
                id="anon-location"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. Tiyan High School, Barrigada"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="anon-phone">Phone or WhatsApp (optional)</Label>
              <Input
                id="anon-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+1 671 555-0100"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="anon-hours">Hours</Label>
              <Input
                id="anon-hours"
                value={form.hours}
                onChange={(e) => setForm((p) => ({ ...p, hours: e.target.value }))}
                placeholder="e.g. 8am–5pm daily, 24/7"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="anon-description">
                Brief description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="anon-description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What service is being provided? Who is it for?"
                rows={3}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
