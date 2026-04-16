import { useState } from "react"
import { ArrowLeft, Phone, AlertTriangle, ExternalLink, Flag, CheckCircle2, Loader2, Send, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

type ContactEntry = {
  label: string
  number: string
  note: string
  confirmed: boolean
  link?: string
}

type ContactGroup = {
  category: string
  color: string
  labelColor: string
  entries: ContactEntry[]
}

const CONTACTS: ContactGroup[] = [
  {
    category: "Non-Emergency / Government",
    color: "border-[#1E3A5F]/30 bg-[#1E3A5F]/5",
    labelColor: "text-[#1E3A5F]",
    entries: [
      { label: "GovGuam Non-Emergency", number: "311", note: "Guam", confirmed: false },
      { label: "GovGuam Emergency Hotline (OCD)", number: "(671) 475-9600", note: "Guam OCD", confirmed: false },
      { label: "CNMI Emergency Mgmt", number: "(670) 322-8001", note: "CNMI", confirmed: false },
      {
        label: "Joint Information Center (JIC)",
        number: "(671) 478-0208",
        note: "General information — JIC Release No. 31",
        confirmed: true,
      },
    ],
  },
  {
    category: "Mental Health & Crisis",
    color: "border-purple-400 bg-purple-50",
    labelColor: "text-purple-800",
    entries: [
      {
        label: "GBHWC Suicide & Crisis Lifeline",
        number: "988",
        note: "Call or text 988 · chat at 988lifeline.org · 24/7",
        confirmed: true,
        link: "https://988lifeline.org",
      },
      {
        label: "GBHWC 24-Hour Crisis Hotline",
        number: "(671) 647-8833",
        note: "24/7 crisis support — walk-ins welcome",
        confirmed: true,
        link: "https://gbhwc.guam.gov/services/intake-emergency-services-crisis-hotline-0",
      },
      {
        label: "GBHWC Intake & Emergency Services",
        number: "(671) 647-5440",
        note: "Mon–Fri 8 a.m.–5 p.m. · also (671) 647-5325",
        confirmed: true,
        link: "https://gbhwc.guam.gov/services/intake-emergency-services-crisis-hotline-0",
      },
    ],
  },
  {
    category: "FEMA & Federal Relief",
    color: "border-blue-300 bg-blue-50",
    labelColor: "text-blue-800",
    entries: [
      { label: "FEMA Disaster Assistance", number: "1-800-621-3362", note: "Register for aid", confirmed: false },
      { label: "FEMA TTY", number: "1-800-462-7585", note: "Hearing impaired", confirmed: false },
      { label: "SBA Disaster Loans", number: "1-800-659-2955", note: "Business / homeowner loans", confirmed: false },
    ],
  },
  {
    category: "Health & Medical",
    color: "border-green-400 bg-green-50",
    labelColor: "text-green-800",
    entries: [
      { label: "Guam Memorial Hospital", number: "(671) 647-2552", note: "GMH main", confirmed: false },
      { label: "GRMC Emergency", number: "(671) 645-5500", note: "Guam Regional Medical", confirmed: false },
      { label: "CNMI Commonwealth Health", number: "(670) 236-8831", note: "Saipan", confirmed: false },
      { label: "Poison Control", number: "1-800-222-1222", note: "All islands", confirmed: false },
    ],
  },
  {
    category: "Red Cross & Shelters",
    color: "border-red-300 bg-red-50",
    labelColor: "text-red-700",
    entries: [
      { label: "Red Cross Guam", number: "(671) 472-7234", note: "Shelter & services", confirmed: false },
      { label: "Catholic Social Service", number: "(671) 472-7831", note: "Family services", confirmed: false },
      { label: "Salvation Army Guam", number: "(671) 472-7766", note: "Relief supplies", confirmed: false },
    ],
  },
  {
    category: "Utilities",
    color: "border-yellow-400 bg-yellow-50",
    labelColor: "text-yellow-800",
    entries: [
      {
        label: "GPA 24-Hour Trouble Dispatch",
        number: "(671) 475-1472",
        note: "Down lines, blown transformers, outages — JIC Release No. 31",
        confirmed: true,
      },
      { label: "GPA (Power — Guam) General", number: "(671) 648-3000", note: "Outage reporting", confirmed: false },
      {
        label: "GSWA Customer Service",
        number: "671-646-3111",
        note: "Trash collection & waste — JIC Release No. 31",
        confirmed: true,
      },
      { label: "GWA (Water — Guam)", number: "(671) 647-7800", note: "Water emergencies", confirmed: false },
      { label: "CNMI Power (MPLC)", number: "(670) 235-7000", note: "CNMI", confirmed: false },
    ],
  },
]

type CorrectionFormState = {
  entryLabel: string
  currentNumber: string
} | null

function CorrectionForm({
  entryLabel,
  currentNumber,
  onClose,
}: {
  entryLabel: string
  currentNumber: string
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [suggested, setSuggested] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggested.trim()) {
      toast.error("Please enter the correct number.")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await (supabase as any).from("phone_corrections").insert({
        contact_label: entryLabel,
        current_number: currentNumber,
        suggested_number: suggested.trim(),
        notes: notes.trim() || null,
        submitted_by_name: name.trim() || null,
      } as any)
      if (error) throw error
      toast.success("Correction submitted — thank you!")
      onClose()
    } catch {
      toast.error("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-orange-800">Suggest a correction for this number</p>
        <button onClick={onClose} className="text-orange-400 hover:text-orange-600">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <Label className="text-xs text-orange-700">Correct number <span className="text-destructive">*</span></Label>
          <Input
            value={suggested}
            onChange={(e) => setSuggested(e.target.value)}
            placeholder="e.g. (671) 123-4567"
            className="h-8 text-xs mt-0.5"
            required
          />
        </div>
        <div>
          <Label className="text-xs text-orange-700">Your name (optional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="h-8 text-xs mt-0.5"
          />
        </div>
        <div>
          <Label className="text-xs text-orange-700">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Source or context..."
            rows={2}
            className="text-xs mt-0.5"
          />
        </div>
        <Button type="submit" disabled={submitting} size="sm" className="w-full text-white text-xs" style={{ backgroundColor: "#EA580C" }}>
          {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3 mr-1.5" />Submit</>}
        </Button>
      </form>
    </div>
  )
}

export default function EmergencyContactsPage() {
  const navigate = useNavigate()
  const [openForm, setOpenForm] = useState<CorrectionFormState>(null)

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#1E3A5F] flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
            Emergency Contacts
          </h1>
          <p className="text-sm text-gray-500">
            Mariana Islands — Supertyphoon Sinlaku relief contacts
          </p>
        </div>

        {/* 911 banner */}
        <div className="rounded-xl bg-[#DC2626] text-white p-5 text-center">
          <p className="text-sm font-semibold mb-1">Life-Threatening Emergency</p>
          <a href="tel:911" className="text-5xl font-black tracking-tight hover:underline">
            911
          </a>
          <p className="text-sm mt-1 text-white/80">All islands</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Confirmed from official source</span>
          <span className="flex items-center gap-1"><Flag className="w-3.5 h-3.5 text-orange-500" /> Unverified — tap to suggest update</span>
        </div>

        {CONTACTS.map((group) => (
          <section key={group.category}>
            <h2 className={`text-sm font-semibold mb-2 ${group.labelColor}`}>
              {group.category}
            </h2>
            <div className="space-y-2">
              {group.entries.map((entry) => {
                const isFormOpen =
                  openForm?.entryLabel === entry.label && openForm?.currentNumber === entry.number
                return (
                  <div key={entry.number}>
                    <Card className={`border ${group.color}`}>
                      <CardContent className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-sm">{entry.label}</p>
                            {entry.confirmed
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                              : <Flag className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                            }
                          </div>
                          <p className="text-xs text-muted-foreground">{entry.note}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {entry.link && (
                            <a
                              href={entry.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-[#1E3A5F]"
                              title="Official source"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <a
                            href={`tel:${entry.number.replace(/\D/g, "")}`}
                            className="flex items-center gap-1.5 text-sm font-bold text-[#1E3A5F] hover:underline whitespace-nowrap"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {entry.number}
                          </a>
                          {!entry.confirmed && (
                            <button
                              onClick={() =>
                                setOpenForm(isFormOpen ? null : { entryLabel: entry.label, currentNumber: entry.number })
                              }
                              className="text-xs text-orange-500 hover:text-orange-700 underline ml-1"
                              title="Report inaccuracy"
                            >
                              Update
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    {isFormOpen && (
                      <CorrectionForm
                        entryLabel={entry.label}
                        currentNumber={entry.number}
                        onClose={() => setOpenForm(null)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-gray-400 pt-2 pb-4">
          Numbers marked <Flag className="inline w-3 h-3 text-orange-400" /> are unverified — tap "Update" to suggest a correction.
          Confirmed numbers sourced from official JIC releases and government websites.
        </p>
      </div>
    </div>
  )
}
