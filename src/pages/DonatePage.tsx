import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Heart, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function DonatePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [island, setIsland] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error("Please enter your name.")
    if (!email.trim() && !phone.trim()) return toast.error("Please provide an email or phone so we can reach you.")
    setSubmitting(true)
    try {
      const { error } = await supabase.from("donation_pledges").insert({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        island: island || null,
        amount_pledged: amount.trim() || null,
        message: message.trim() || null,
      } as any)
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
      <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center justify-center px-4 py-12 text-center">
        <Heart className="w-12 h-12 text-[#DC2626] mb-4" />
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Thank You</h1>
        <p className="text-sm text-gray-600 max-w-sm mb-6">
          Your pledge has been received. We'll reach out with details on how to donate to the Sinlaku Relief Fund.
        </p>
        <Link to="/" className="text-sm text-[#1E3A5F] font-semibold hover:underline">
          Back to Directory
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#1E3A5F] hover:opacity-70 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Support Sinlaku Relief</h1>
        </div>

        <Card className="border-2 border-[#DC2626]/20 bg-[#DC2626]/5">
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#DC2626]" />
              <p className="font-semibold text-[#1E3A5F]">General Relief Fund</p>
            </div>
            <p className="text-sm text-gray-700">
              Funds go directly to <strong>Guahan.TECH</strong> for platform operating costs
              and direct, on-call support for affected communities during and after Supertyphoon Sinlaku.
            </p>
            <p className="text-xs text-gray-500">
              This is not a 501(c)(3). All pledges are completely transparent — we will
              message every pledger with updates on how funds are used and how to donate.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1E3A5F]">Pledge to Donate</CardTitle>
            <p className="text-xs text-gray-500">
              Fill out this form to pledge your support. We'll contact you with donation details.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pledge-name">Your name <span className="text-destructive">*</span></Label>
                <Input id="pledge-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pledge-email">Email</Label>
                  <Input id="pledge-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pledge-phone">Phone</Label>
                  <Input id="pledge-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 671 555-0100" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Island</Label>
                  <Select value={island} onValueChange={setIsland}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guam">Guam</SelectItem>
                      <SelectItem value="saipan">Saipan</SelectItem>
                      <SelectItem value="tinian">Tinian</SelectItem>
                      <SelectItem value="rota">Rota</SelectItem>
                      <SelectItem value="other">Other / Off-Island</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pledge-amount">Amount (optional)</Label>
                  <Input id="pledge-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. $50, whatever I can" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pledge-message">Message (optional)</Label>
                <Textarea id="pledge-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Any message for the team..." rows={3} />
              </div>

              <Button type="submit" disabled={submitting} className="w-full text-white" style={{ backgroundColor: "#DC2626" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit Pledge</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center">
          Questions? Contact <a href="https://wa.me/16716887638" className="text-[#1E3A5F] underline">+1 671 688 7638</a> or <a href="mailto:admin@guahan.tech" className="text-[#1E3A5F] underline">admin@guahan.tech</a>
        </p>
      </div>
    </div>
  )
}
