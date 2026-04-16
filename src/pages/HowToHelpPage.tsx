import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Users, HandHelping, DollarSign, ShieldCheck, ArrowRight, ClipboardList } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import Disclaimer from "@/components/Disclaimer"

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)
}

export default function HowToHelpPage() {
  const [totalDonated, setTotalDonated] = useState<number | null>(null)

  useEffect(() => {
    supabase
      .from("donations")
      .select("amount")
      .eq("status", "confirmed")
      .then(({ data }) => {
        if (data) setTotalDonated(data.reduce((s, d) => s + Number(d.amount), 0))
      })
  }, [])

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">

      {/* Hero */}
      <div className="bg-[#1E3A5F] text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto text-red-400" />
          <h1 className="text-3xl font-bold">How to Help</h1>
          <p className="text-white/80 text-sm max-w-lg mx-auto">
            Supertyphoon Sinlaku has impacted communities across Guam and the Mariana Islands.
            Every form of help matters — money, time, or skills.
          </p>
          {totalDonated !== null && (
            <div className="inline-block bg-white/10 rounded-xl px-6 py-3 mt-2">
              <p className="text-xs text-white/60 mb-0.5">Community has raised</p>
              <p className="text-3xl font-bold">{fmt(totalDonated)}</p>
              <p className="text-xs text-white/60 mt-0.5">
                <Link to="/transparency" className="underline">See exactly where it goes →</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Disclaimer */}
        <Disclaimer />

        {/* Option 1: Donate */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#DC2626]/10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-[#DC2626]" />
            </div>
            <h2 className="text-xl font-bold text-[#1E3A5F]">Donate Financially</h2>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            Monetary donations reach families fastest. Every dollar donated is tracked publicly —
            you can see exactly who received it and what it was used for.
          </p>
          <div className="ml-12 space-y-2">
            <Link
              to="/donate"
              className="flex items-center justify-between bg-[#DC2626] text-white rounded-xl px-5 py-4 hover:bg-red-700 transition"
            >
              <span className="font-bold">Donate Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/transparency"
              className="flex items-center justify-between border-2 border-[#1E3A5F]/20 text-[#1E3A5F] rounded-xl px-5 py-3.5 hover:bg-[#1E3A5F]/5 transition text-sm"
            >
              <span className="font-semibold">See where donations go (live)</span>
              <ShieldCheck className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Option 2: Volunteer */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center shrink-0">
              <HandHelping className="w-5 h-5 text-[#1E3A5F]" />
            </div>
            <h2 className="text-xl font-bold text-[#1E3A5F]">Volunteer Your Time</h2>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            Cleanup, food distribution, childcare, transportation — relief organizations
            need hands on the ground right now.
          </p>
          <div className="ml-12 space-y-2">
            <Link
              to="/volunteer/sheets"
              className="flex items-center justify-between bg-[#1E3A5F] text-white rounded-xl px-5 py-4 hover:bg-[#2a4f7a] transition"
            >
              <span className="font-bold">See Volunteer Opportunities</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/volunteer"
              className="flex items-center justify-between border-2 border-[#1E3A5F]/20 text-[#1E3A5F] rounded-xl px-5 py-3.5 hover:bg-[#1E3A5F]/5 transition text-sm"
            >
              <span className="font-semibold">General volunteer sign-up</span>
              <ClipboardList className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Option 3: Lead / Fund Leader */}
        <section id="leader" className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-green-700" />
            </div>
            <h2 className="text-xl font-bold text-[#1E3A5F]">Lead a Relief Effort</h2>
          </div>
          <p className="text-sm text-gray-600 ml-12">
            Organizations can apply to become a <strong>Fund Leader</strong> — receiving and
            managing allocated donations for a specific area or service. Your name, organization,
            and every transaction are publicly listed. This accountability is what makes the
            community's trust possible.
          </p>

          <Card className="ml-12 border-2 border-green-200 bg-green-50">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm font-semibold text-green-900">Requirements to apply:</p>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Registered organization (or recognized community group)</li>
                <li>Physical address on a Mariana Island</li>
                <li>Contact person willing to be publicly listed</li>
                <li>Commitment to provide receipts for all disbursements</li>
              </ul>
              <p className="text-xs text-green-700">
                Applications are reviewed by <strong>admin@guahan.tech</strong>. Approved leaders appear on the live transparency dashboard immediately.
              </p>
              <Link
                to="/fund-leader/apply"
                className="inline-flex items-center gap-2 bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-green-800 transition"
              >
                <Users className="w-4 h-4" />
                Apply as Fund Leader
              </Link>
            </CardContent>
          </Card>
        </section>

        <hr className="border-gray-100" />

        {/* Transparency commitment */}
        <section className="bg-[#1E3A5F]/5 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1E3A5F]" />
            <h3 className="font-bold text-[#1E3A5F]">Our Commitment to Zero Waste</h3>
          </div>
          <p className="text-sm text-gray-700">
            Every dollar donated to this platform is tracked on a public ledger. Fund leaders
            are named, addressed, and accountable. Unallocated funds are shown — not hidden.
            Every disbursement requires a description and encourages a receipt.
          </p>
          <p className="text-sm text-gray-700">
            We believe the communities sending help deserve to know exactly where it goes.
          </p>
          <Link to="/transparency" className="text-sm font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1">
            View the live transparency dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        <p className="text-xs text-center text-gray-400 pb-4">
          Built by Guåhan.TECH for the Mariana Islands.{" "}
          <a href="mailto:admin@guahan.tech" className="underline">admin@guahan.tech</a>
        </p>
      </div>
    </div>
  )
}
