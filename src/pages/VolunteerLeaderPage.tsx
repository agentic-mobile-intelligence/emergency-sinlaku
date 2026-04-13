import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

const SKILLS: { value: string; label: string }[] = [
  { value: "cleanup", label: "Cleanup / Debris removal" },
  { value: "food_distribution", label: "Food distribution" },
  { value: "shelter_management", label: "Shelter management" },
  { value: "transportation", label: "Transportation coordination" },
  { value: "medical_support", label: "Medical support (licensed)" },
  { value: "emotional_support", label: "Emotional / mental health support" },
  { value: "childcare", label: "Childcare" },
  { value: "translation", label: "Translation (Chamorro, Chuukese, Carolinian, Tagalog…)" },
  { value: "general_labor", label: "General labor / operations" },
  { value: "other", label: "Other" },
]

const AVAILABILITY: { value: string; label: string }[] = [
  { value: "weekday_mornings", label: "Weekday mornings" },
  { value: "weekday_afternoons", label: "Weekday afternoons" },
  { value: "weekday_evenings", label: "Weekday evenings" },
  { value: "weekend_mornings", label: "Weekend mornings" },
  { value: "weekend_afternoons", label: "Weekend afternoons" },
  { value: "weekend_evenings", label: "Weekend evenings" },
  { value: "anytime", label: "Anytime" },
]

interface FormState {
  display_name: string
  contact: string
  island: string
  skills: string[]
  availability: string[]
  experience: string
  team_capacity: string
  notes: string
  is_public: boolean
  privacy_acknowledged: boolean
}

const defaultForm: FormState = {
  display_name: "",
  contact: "",
  island: "",
  skills: [],
  availability: [],
  experience: "",
  team_capacity: "",
  notes: "",
  is_public: false,
  privacy_acknowledged: false,
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
}

export default function VolunteerLeaderPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(defaultForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (form.skills.length === 0) e.skills = "Select at least one area you can lead."
    if (!form.island) e.island = "Please select your island."
    if (!form.privacy_acknowledged) e.privacy_acknowledged = "Please acknowledge the privacy notice."
    const cap = form.team_capacity.trim()
    if (cap && (isNaN(Number(cap)) || Number(cap) < 1)) {
      e.team_capacity = "Enter a whole number (e.g. 10)."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("volunteer_leader_signups").insert({
        display_name: form.display_name.trim() || null,
        contact: form.contact.trim() || null,
        island: form.island as "guam" | "saipan" | "tinian" | "rota",
        skills: form.skills,
        availability: form.availability,
        experience: form.experience.trim() || null,
        team_capacity: form.team_capacity.trim() ? Number(form.team_capacity) : null,
        notes: form.notes.trim() || null,
        is_public: form.is_public,
        privacy_acknowledged: form.privacy_acknowledged,
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      toast.error("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-88px)] bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6 py-8">
          <div className="text-5xl">🙌</div>
          <h2 className="text-2xl font-bold text-[#1E3A5F]">Thank You, Leader!</h2>
          <p className="text-gray-600">
            Your sign-up has been received. A coordinator may reach out to discuss how you
            can best lead and support relief teams.
          </p>
          <div className="space-y-3">
            <Button className="w-full h-12 bg-[#1E3A5F]" onClick={() => navigate("/volunteer/sheets")}>
              See All Volunteer Sheets
            </Button>
            <Button variant="outline" className="w-full h-12" onClick={() => navigate("/")}>
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Volunteer Leader Sign-Up</h1>
          <p className="text-sm text-gray-500">
            Sign up to coordinate or lead a volunteer team during Supertyphoon Sinlaku relief.
            No account required.
          </p>
        </div>

        {/* Cross-link to regular volunteer */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">Just want to volunteer (not lead)?</p>
          <Link
            to="/volunteer"
            className="text-sm font-semibold text-[#1E3A5F] hover:underline whitespace-nowrap"
          >
            Volunteer Sign-Up →
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-7">

              {/* Privacy Notice */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <strong>Privacy Notice:</strong> Your contact details may be shared with relief
                organizations to coordinate your leadership role. You can choose to keep your
                name and details anonymous — only your skills and availability will be shown publicly.
              </div>

              {/* Island */}
              <fieldset className="space-y-2">
                <Label className="text-base font-semibold">
                  Your Island <span className="text-destructive">*</span>
                </Label>
                <Select value={form.island} onValueChange={(v) => set("island", v)}>
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

              {/* Skills — framed as "what can you lead" */}
              <fieldset className="space-y-3">
                <legend className="text-base font-semibold">
                  What Can You Lead? <span className="text-destructive">*</span>
                </legend>
                <div className="space-y-2">
                  {SKILLS.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5"
                    >
                      <Checkbox
                        checked={form.skills.includes(value)}
                        onCheckedChange={() => set("skills", toggleItem(form.skills, value))}
                        className="h-5 w-5 flex-shrink-0"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                {errors.skills && <p className="text-sm text-destructive">{errors.skills}</p>}
              </fieldset>

              {/* Availability */}
              <fieldset className="space-y-3">
                <legend className="text-base font-semibold">
                  When Are You Available?{" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABILITY.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5"
                    >
                      <Checkbox
                        checked={form.availability.includes(value)}
                        onCheckedChange={() => set("availability", toggleItem(form.availability, value))}
                        className="h-4 w-4 flex-shrink-0"
                      />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Leadership Experience */}
              <fieldset className="space-y-2">
                <Label htmlFor="experience" className="text-base font-semibold">
                  Leadership Experience{" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Briefly describe relevant coordination or emergency response experience.
                </p>
                <Textarea
                  id="experience"
                  className="text-base min-h-[80px]"
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="e.g. Led Red Cross shelter team during previous typhoon response, 5 years community organizing…"
                />
              </fieldset>

              {/* Team Capacity */}
              <fieldset className="space-y-2">
                <Label htmlFor="team_capacity" className="text-base font-semibold">
                  Team Size You Can Manage{" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Roughly how many volunteers could you coordinate at once?
                </p>
                <Input
                  id="team_capacity"
                  type="number"
                  min={1}
                  className="h-12 text-base w-40"
                  value={form.team_capacity}
                  onChange={(e) => set("team_capacity", e.target.value)}
                  placeholder="e.g. 10"
                />
                {errors.team_capacity && <p className="text-sm text-destructive">{errors.team_capacity}</p>}
              </fieldset>

              {/* Public / Anonymous */}
              <fieldset className="space-y-3">
                <legend className="text-base font-semibold">Response Visibility</legend>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5">
                    <input
                      type="radio"
                      name="visibility"
                      checked={!form.is_public}
                      onChange={() => set("is_public", false)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">Anonymous</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Only your skills and availability are shown. Your name and contact details are kept private and only sent to the volunteer organization.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5">
                    <input
                      type="radio"
                      name="visibility"
                      checked={form.is_public}
                      onChange={() => set("is_public", true)}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium">Public</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your name and skills are visible to volunteer coordinators and other helpers on the platform.
                      </p>
                    </div>
                  </label>
                </div>
              </fieldset>

              {/* Name */}
              <fieldset className="space-y-2">
                <Label htmlFor="display_name" className="text-base font-semibold">
                  Name or Alias{" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground">First name or a nickname is fine.</p>
                <Input
                  id="display_name"
                  className="h-12 text-base"
                  value={form.display_name}
                  onChange={(e) => set("display_name", e.target.value)}
                  placeholder="e.g. Maria or Anonymous"
                />
              </fieldset>

              {/* Contact */}
              <fieldset className="space-y-2">
                <Label htmlFor="contact" className="text-base font-semibold">
                  Contact (Phone or Email){" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  So a coordinator can reach you. Not shown publicly unless you chose Public above.
                </p>
                <Input
                  id="contact"
                  className="h-12 text-base"
                  value={form.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder="(671) 555-0100 or you@example.com"
                />
              </fieldset>

              {/* Notes */}
              <fieldset className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  Anything Else?{" "}
                  <span className="text-sm font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  className="text-base min-h-[80px]"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Languages you speak, specific areas of Guam/CNMI you can cover, other context…"
                />
              </fieldset>

              {/* Privacy acknowledgment */}
              <fieldset>
                <label className="flex items-start gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent transition-colors has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5">
                  <Checkbox
                    checked={form.privacy_acknowledged}
                    onCheckedChange={(v) => set("privacy_acknowledged", v === true)}
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-sm">
                    I understand that my contact details may be shared with a volunteer organization to coordinate my leadership role, and that I can choose to remain anonymous. <span className="text-destructive">*</span>
                  </p>
                </label>
                {errors.privacy_acknowledged && (
                  <p className="text-sm text-destructive mt-1">{errors.privacy_acknowledged}</p>
                )}
              </fieldset>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base bg-[#1E3A5F]"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : "Submit Leader Sign-Up"}
              </Button>

              <p className="text-xs text-center text-muted-foreground pb-2">
                No account required. Looking to volunteer instead?{" "}
                <Link to="/volunteer" className="underline">Volunteer sign-up →</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 py-2">
          Built with <Heart className="h-3 w-3 text-red-500 mx-1" /> by Guåhan.TECH for the Mariana Islands
        </div>
      </div>
    </div>
  )
}
