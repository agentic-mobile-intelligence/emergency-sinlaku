import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Heart, Loader2, ShieldCheck, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Disclaimer from "@/components/Disclaimer"

const PRESETS = [25, 50, 100, 250]

const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam",
  saipan: "Saipan",
  tinian: "Tinian",
  rota: "Rota",
}

export default function DonatePage() {
  const [preset, setPreset] = useState<number | null>(null)
  const [custom, setCustom] = useState("")
  const [earmark, setEarmark] = useState<string>("")
  const [donorName, setDonorName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const amount = preset ?? (parseFloat(custom) || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (amount <= 0) return toast.error("Please select or enter an amount.")
    setSubmitting(true)
    try {
      // Find active campaign
      const { data: campaign } = await supabase
        .from("donation_campaigns")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single()

      const { error } = await supabase.from("donations").insert({
        campaign_id: campaign?.id ?? null,
        amount,
        donor_name: donorName.trim() || null,
        donor_email: email.trim() || null,
        message: message.trim() || null,
        island_earmark: (earmark as any) || null,
        is_public: isPublic,
        status: "pending",
        payment_method: "other",
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
      <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center justify-center px-4 py-12 text-center space-y-5">
        <Heart className="w-12 h-12 text-[#DC2626]" />
        <h1 className="text-2xl font-bold text-[#1E3A5F]">Thank You</h1>
        <p className="text-sm text-gray-600 max-w-sm">
          Your donation intent of <strong>${amount.toLocaleString()}</strong> has been recorded.
          Our team will contact you at the email provided with payment instructions.
          Once confirmed, your donation appears on our public transparency dashboard.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Link
            to="/transparency"
            className="bg-[#1E3A5F] text-white font-semibold text-sm px-4 py-3 rounded-lg hover:bg-[#2a4f7a] transition text-center"
          >
            View Live Transparency Dashboard →
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
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Donate to Sinlaku Relief</h1>
        </div>

        {/* Trust statement */}
        <div className="flex items-start gap-3 bg-[#1E3A5F]/5 rounded-xl px-4 py-3">
          <ShieldCheck className="w-5 h-5 text-[#1E3A5F] shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E3A5F]">
            Every dollar is tracked publicly. Your donation appears on our{" "}
            <Link to="/transparency" className="font-semibold underline">live transparency dashboard</Link>{" "}
            once confirmed — including who received it and what it was used for.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Amount <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPreset(p); setCustom("") }}
                  className={`rounded-lg border-2 py-3 text-sm font-bold transition ${
                    preset === p
                      ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                      : "border-border hover:border-[#1E3A5F] hover:bg-[#1E3A5F]/5"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min="1"
              step="1"
              placeholder="Custom amount ($)"
              value={custom}
              onChange={(e) => { setCustom(e.target.value); setPreset(null) }}
              className="h-11 text-base"
            />
          </div>

          {/* Earmark */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">
              Direct funds to an island{" "}
              <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["", "guam", "saipan", "tinian", "rota"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setEarmark(v)}
                  className={`rounded-lg border-2 py-2.5 text-sm font-semibold transition ${
                    earmark === v
                      ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                      : "border-border hover:border-[#1E3A5F] hover:bg-[#1E3A5F]/5"
                  }`}
                >
                  {v === "" ? "General Relief" : ISLAND_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          {/* Donor info */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Your info{" "}
              <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              placeholder="Your name (or leave blank to donate anonymously)"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="h-11"
            />
            <Input
              type="email"
              placeholder="Email for payment instructions"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
            <Textarea
              placeholder="Message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>

          {/* Public toggle */}
          <label className="flex items-center gap-3 rounded-xl border-2 border-border px-4 py-3 cursor-pointer hover:bg-gray-50 transition has-[:checked]:border-[#1E3A5F] has-[:checked]:bg-[#1E3A5F]/5">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 shrink-0"
            />
            <div>
              <p className="text-sm font-medium">Show my name on the public dashboard</p>
              <p className="text-xs text-muted-foreground">Unchecked = "Anonymous" on the transparency page</p>
            </div>
          </label>

          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-base bg-[#DC2626] hover:bg-red-700"
            disabled={submitting || amount <= 0}
          >
            {submitting
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <><DollarSign className="w-5 h-5 mr-1" /> Record Donation Intent {amount > 0 ? `— $${amount.toLocaleString()}` : ""}</>
            }
          </Button>

          {/* Disclaimer */}
          <Disclaimer />

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4 pb-4 text-xs text-amber-900 space-y-1">
              <p className="font-semibold">Payment instructions:</p>
              <p>After submitting, our team will email you Zelle / PayPal / bank transfer details within 24 hours. We are not yet set up for direct card processing. Your donation is recorded immediately for transparency.</p>
              <p>Questions: <a href="mailto:admin@guahan.tech" className="underline">admin@guahan.tech</a> · <a href="https://wa.me/16716887638" className="underline">WhatsApp</a></p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
