import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AlertTriangle, Phone, ChevronRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type Island = Database["public"]["Enums"]["island"]
type ServiceType = Database["public"]["Enums"]["service_type"]
type MedicalNeed = Database["public"]["Enums"]["medical_need"]
type Accessibility = Database["public"]["Enums"]["accessibility"]

const NEEDS_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "water", label: "Water" },
  { value: "shelter", label: "Shelter" },
  { value: "tarps", label: "Tarps" },
  { value: "medical", label: "Medical" },
  { value: "clothing", label: "Clothing" },
  { value: "transportation", label: "Transportation" },
  { value: "cleanup", label: "Cleanup / Other" },
]

const MEDICAL_NEED_OPTIONS: { value: MedicalNeed; label: string }[] = [
  { value: "wheelchair", label: "Wheelchair" },
  { value: "oxygen_ventilator", label: "Oxygen / Ventilator" },
  { value: "dialysis", label: "Dialysis" },
  { value: "insulin_medication", label: "Insulin / Medication" },
  { value: "mobility_aid", label: "Mobility Aid" },
  { value: "other", label: "Other" },
]

const emergencyContacts = [
  { label: "Emergency", number: "911" },
  { label: "Non-Emergency", number: "311" },
  { label: "FEMA", number: "1-800-621-3362" },
]

// ── Step 1: Emergency contacts gate ─────────────────────────────────────────

function EmergencyGate({ onProceed }: { onProceed: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-destructive bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
          <h2 className="text-lg font-bold text-destructive">Emergency Contacts</h2>
        </div>
        <div className="space-y-3">
          {emergencyContacts.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number.replace(/-/g, "")}`}
              className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3 text-base font-medium hover:bg-accent transition-colors"
            >
              <span className="text-muted-foreground">{c.label}</span>
              <span className="font-mono font-bold text-foreground">{c.number}</span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          If this is a life-threatening emergency, call 911 now. Services are subject to availability.
        </p>
      </div>

      <Button
        size="lg"
        className="w-full text-base h-14"
        onClick={onProceed}
      >
        Fill out Aid Request Form
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  )
}

// ── Step 2: The form ─────────────────────────────────────────────────────────

interface FormState {
  name: string
  island: Island | ""
  landline_phone: string
  mobile_phone: string
  email: string
  no_contact_explanation: string
  household_size: string
  needs: ServiceType[]
  dogs_nearby: "" | "yes" | "no"
  safely_accessible: Accessibility | ""
  medical_needs: MedicalNeed[]
  medical_notes: string
  elderly_count: string
  children_count: string
  disabled_count: string
  cannot_relocate: boolean
  notes: string
}

const defaultForm: FormState = {
  name: "",
  island: "",
  landline_phone: "",
  mobile_phone: "",
  email: "",
  no_contact_explanation: "",
  household_size: "",
  needs: [],
  dogs_nearby: "",
  safely_accessible: "",
  medical_needs: [],
  medical_notes: "",
  elderly_count: "",
  children_count: "",
  disabled_count: "",
  cannot_relocate: false,
  notes: "",
}

function hasContact(f: FormState) {
  return f.landline_phone.trim() || f.mobile_phone.trim() || f.email.trim()
}

function AidRequestForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) e.name = "Name is required."
    if (!form.island) e.island = "Island is required."
    if (!hasContact(form) && !form.no_contact_explanation.trim()) {
      e.no_contact_explanation =
        "Please provide a phone number, email, or explain how we can reach you."
    }
    if (!form.household_size || Number(form.household_size) < 1) {
      e.household_size = "Number of people is required."
    }
    if (form.needs.length === 0) e.needs = "Select at least one need."
    if (!form.dogs_nearby) e.dogs_nearby = "Please answer."
    if (!form.safely_accessible) e.safely_accessible = "Please answer."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("aid_requests").insert({
        name: form.name.trim(),
        island: form.island as Island,
        landline_phone: form.landline_phone.trim() || null,
        mobile_phone: form.mobile_phone.trim() || null,
        email: form.email.trim() || null,
        no_contact_explanation: form.no_contact_explanation.trim() || null,
        household_size: Number(form.household_size),
        needs: form.needs,
        dogs_nearby: form.dogs_nearby === "yes",
        safely_accessible: form.safely_accessible as Accessibility,
        medical_needs: form.medical_needs.length > 0 ? form.medical_needs : null,
        medical_notes: form.medical_notes.trim() || null,
        elderly_count: form.elderly_count ? Number(form.elderly_count) : null,
        children_count: form.children_count ? Number(form.children_count) : null,
        disabled_count: form.disabled_count ? Number(form.disabled_count) : null,
        cannot_relocate: form.cannot_relocate,
        notes: form.notes.trim() || null,
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error("Submission failed. Please try again or call FEMA at 1-800-621-3362.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="text-5xl">✅</div>
        <h2 className="text-2xl font-bold">Request Submitted</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your aid request has been received and is now visible to registered service providers.
          They will reach out using the contact information you provided.
        </p>
        <div className="space-y-3">
          <Button className="w-full h-14 text-base" onClick={() => navigate("/")}>
            Back to Home
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-base"
            onClick={() => { setForm(defaultForm); setSubmitted(false) }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Privacy Notice */}
      <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 p-4 text-sm text-blue-900 dark:text-blue-200">
        <strong>Privacy Notice:</strong> This form does NOT collect Social Security Numbers,
        home addresses, or other confidential personal information. Your request will be
        visible to registered service providers on this platform.
      </div>

      {/* Name */}
      <fieldset className="space-y-2">
        <Label htmlFor="name" className="text-base font-semibold">
          Your Name <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">First name or alias is fine.</p>
        <Input
          id="name"
          className="h-12 text-base"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Maria"
          aria-required
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </fieldset>

      {/* Island */}
      <fieldset className="space-y-2">
        <Label className="text-base font-semibold">
          Your Island <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.island}
          onValueChange={(v) => set("island", v as Island)}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select island…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guam">Guam</SelectItem>
            <SelectItem value="saipan">Saipan</SelectItem>
            <SelectItem value="tinian">Tinian</SelectItem>
            <SelectItem value="rota">Rota</SelectItem>
          </SelectContent>
        </Select>
        {errors.island && <p className="text-sm text-destructive">{errors.island}</p>}
      </fieldset>

      {/* Contact Methods */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">Contact Information</legend>
        <p className="text-xs text-muted-foreground">
          Provide at least one way for responders to reach you — or explain below.
        </p>

        <div className="space-y-2">
          <Label htmlFor="landline" className="text-sm font-medium">
            Landline Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="landline"
            type="tel"
            className="h-12 text-base"
            value={form.landline_phone}
            onChange={(e) => set("landline_phone", e.target.value)}
            placeholder="(671) 555-0100"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-sm font-medium">
            Mobile Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="mobile"
            type="tel"
            className="h-12 text-base"
            value={form.mobile_phone}
            onChange={(e) => set("mobile_phone", e.target.value)}
            placeholder="(671) 555-0200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            className="h-12 text-base"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        {/* Conditional: no contact method */}
        {!hasContact(form) && (
          <div className="space-y-2">
            <Label htmlFor="no_contact" className="text-sm font-medium">
              How can we reach you? <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Since no phone or email was provided, describe how responders can contact you.
            </p>
            <Textarea
              id="no_contact"
              className="text-base min-h-[96px]"
              value={form.no_contact_explanation}
              onChange={(e) => set("no_contact_explanation", e.target.value)}
              placeholder="e.g. I'm at my neighbor Rosa's house in Dededo. Ask for Maria."
            />
            {errors.no_contact_explanation && (
              <p className="text-sm text-destructive">{errors.no_contact_explanation}</p>
            )}
          </div>
        )}
      </fieldset>

      {/* Household Size */}
      <fieldset className="space-y-2">
        <Label htmlFor="household_size" className="text-base font-semibold">
          Number of People in Your Household / Group{" "}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="household_size"
          type="number"
          min={1}
          max={999}
          className="h-12 text-base w-32"
          value={form.household_size}
          onChange={(e) => set("household_size", e.target.value)}
          placeholder="e.g. 4"
        />
        {errors.household_size && (
          <p className="text-sm text-destructive">{errors.household_size}</p>
        )}
      </fieldset>

      {/* Needs Checklist */}
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">
          What Do You Need? <span className="text-destructive">*</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {NEEDS_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <Checkbox
                checked={form.needs.includes(value)}
                onCheckedChange={() =>
                  set("needs", toggleArrayItem(form.needs, value))
                }
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
        {errors.needs && <p className="text-sm text-destructive">{errors.needs}</p>}
      </fieldset>

      {/* Dogs Nearby */}
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">
          Are there dogs near your home?{" "}
          <span className="text-destructive">*</span>
        </legend>
        <p className="text-xs text-muted-foreground">
          This helps responders stay safe when arriving.
        </p>
        <RadioGroup
          value={form.dogs_nearby}
          onValueChange={(v) => set("dogs_nearby", v as "yes" | "no")}
          className="flex gap-4"
        >
          {["yes", "no"].map((v) => (
            <label
              key={v}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex-1"
            >
              <RadioGroupItem value={v} className="h-5 w-5 flex-shrink-0" />
              <span className="text-base font-medium capitalize">{v}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.dogs_nearby && (
          <p className="text-sm text-destructive">{errors.dogs_nearby}</p>
        )}
      </fieldset>

      {/* Safely Accessible */}
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">
          Is your location safely accessible?{" "}
          <span className="text-destructive">*</span>
        </legend>
        <p className="text-xs text-muted-foreground">
          e.g. roads clear, no flooding, no fallen trees blocking access.
        </p>
        <RadioGroup
          value={form.safely_accessible}
          onValueChange={(v) => set("safely_accessible", v as Accessibility)}
          className="flex gap-3 flex-wrap"
        >
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "unsure", label: "Unsure" },
          ].map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex-1 min-w-[80px]"
            >
              <RadioGroupItem value={value} className="h-5 w-5 flex-shrink-0" />
              <span className="text-base font-medium">{label}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.safely_accessible && (
          <p className="text-sm text-destructive">{errors.safely_accessible}</p>
        )}
      </fieldset>

      {/* Medical Needs */}
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">
          Medical Needs{" "}
          <span className="text-muted-foreground text-sm font-normal">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {MEDICAL_NEED_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <Checkbox
                checked={form.medical_needs.includes(value)}
                onCheckedChange={() =>
                  set("medical_needs", toggleArrayItem(form.medical_needs, value))
                }
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Medical Notes */}
      <fieldset className="space-y-2">
        <Label htmlFor="medical_notes" className="text-base font-semibold">
          Medical Notes{" "}
          <span className="text-muted-foreground text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          id="medical_notes"
          className="text-base min-h-[80px]"
          value={form.medical_notes}
          onChange={(e) => set("medical_notes", e.target.value)}
          placeholder='e.g. "Father needs daily insulin injection."'
        />
      </fieldset>

      {/* Household Vulnerability Counts */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold">
          Household Composition{" "}
          <span className="text-muted-foreground text-sm font-normal">(optional)</span>
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="elderly" className="text-sm font-medium">
              Elderly (65+)
            </Label>
            <Input
              id="elderly"
              type="number"
              min={0}
              max={99}
              className="h-12 text-base"
              value={form.elderly_count}
              onChange={(e) => set("elderly_count", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="children" className="text-sm font-medium">
              Children (&lt;18)
            </Label>
            <Input
              id="children"
              type="number"
              min={0}
              max={99}
              className="h-12 text-base"
              value={form.children_count}
              onChange={(e) => set("children_count", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled" className="text-sm font-medium">
              Disabled
            </Label>
            <Input
              id="disabled"
              type="number"
              min={0}
              max={99}
              className="h-12 text-base"
              value={form.disabled_count}
              onChange={(e) => set("disabled_count", e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </fieldset>

      {/* Cannot Relocate */}
      <fieldset>
        <label className="flex items-start gap-4 rounded-lg border-2 border-border bg-card p-4 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-destructive has-[:checked]:bg-destructive/5">
          <Checkbox
            id="cannot_relocate"
            checked={form.cannot_relocate}
            onCheckedChange={(v) => set("cannot_relocate", v === true)}
            className="h-6 w-6 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-base font-semibold">I cannot leave my location</p>
            <p className="text-xs text-muted-foreground mt-1">
              Check this if you are unable to travel to a distribution point. Service providers
              will prioritize delivery to your location.
            </p>
          </div>
        </label>
      </fieldset>

      {/* Additional Notes */}
      <fieldset className="space-y-2">
        <Label htmlFor="notes" className="text-base font-semibold">
          Additional Notes{" "}
          <span className="text-muted-foreground text-sm font-normal">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          className="text-base min-h-[96px]"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Any other information that would help responders assist you."
        />
      </fieldset>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-base"
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Aid Request"}
      </Button>

      <p className="text-xs text-center text-muted-foreground pb-4">
        Your request will be visible to all registered service providers on this platform.
        No Social Security Numbers or home addresses are collected or stored.
      </p>
    </form>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RequestAidPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
              Typhoon Sinlaku Relief
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:911"
              className="text-sm font-mono font-bold text-destructive-foreground underline-offset-2 hover:underline"
            >
              911
            </a>
            <a
              href="tel:18006213362"
              className="text-xs text-destructive-foreground/80 hover:text-destructive-foreground"
            >
              FEMA
            </a>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Request Aid</h1>
            <p className="text-muted-foreground mt-1">
              Tell us what you need. Registered service providers will see your request and
              reach out.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {!showForm ? (
                <EmergencyGate onProceed={() => setShowForm(true)} />
              ) : (
                <AidRequestForm />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Built with <Heart className="h-3 w-3 text-destructive mx-1" /> by Guahan.TECH for the Mariana Islands
        </div>
      </footer>
    </div>
  )
}
