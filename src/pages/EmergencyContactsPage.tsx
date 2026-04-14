import { ArrowLeft, Phone, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"

const CONTACTS = [
  {
    category: "Life-Threatening Emergency",
    color: "border-red-500 bg-red-50",
    labelColor: "text-red-700",
    entries: [
      { label: "Police / Fire / Medical", number: "911", note: "All islands" },
    ],
  },
  {
    category: "Non-Emergency / Government",
    color: "border-[#1E3A5F]/30 bg-[#1E3A5F]/5",
    labelColor: "text-[#1E3A5F]",
    entries: [
      { label: "GovGuam Non-Emergency", number: "311", note: "Guam" },
      { label: "GovGuam Emergency Hotline", number: "(671) 475-9600", note: "Guam OCD" },
      { label: "CNMI Emergency Mgmt", number: "(670) 322-8001", note: "CNMI" },
    ],
  },
  {
    category: "FEMA & Federal Relief",
    color: "border-blue-300 bg-blue-50",
    labelColor: "text-blue-800",
    entries: [
      { label: "FEMA Disaster Assistance", number: "1-800-621-3362", note: "Register for aid" },
      { label: "FEMA TTY", number: "1-800-462-7585", note: "Hearing impaired" },
      { label: "SBA Disaster Loans", number: "1-800-659-2955", note: "Business / homeowner loans" },
    ],
  },
  {
    category: "Health & Medical",
    color: "border-green-400 bg-green-50",
    labelColor: "text-green-800",
    entries: [
      { label: "Guam Memorial Hospital", number: "(671) 647-2552", note: "GMH main" },
      { label: "GRMC Emergency", number: "(671) 645-5500", note: "Guam Regional Medical" },
      { label: "CNMI Commonwealth Health", number: "(670) 236-8831", note: "Saipan" },
      { label: "Poison Control", number: "1-800-222-1222", note: "All islands" },
    ],
  },
  {
    category: "Red Cross & Shelters",
    color: "border-red-300 bg-red-50",
    labelColor: "text-red-700",
    entries: [
      { label: "Red Cross Guam", number: "(671) 472-7234", note: "Shelter & services" },
      { label: "Catholic Social Service", number: "(671) 472-7831", note: "Family services" },
      { label: "Salvation Army Guam", number: "(671) 472-7766", note: "Relief supplies" },
    ],
  },
  {
    category: "Utilities",
    color: "border-yellow-400 bg-yellow-50",
    labelColor: "text-yellow-800",
    entries: [
      { label: "GPA (Power — Guam)", number: "(671) 648-3000", note: "Outage reporting" },
      { label: "GWA (Water — Guam)", number: "(671) 647-7800", note: "Water emergencies" },
      { label: "CNMI Power (MPLC)", number: "(670) 235-7000", note: "CNMI" },
    ],
  },
]

export default function EmergencyContactsPage() {
  const navigate = useNavigate()

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

        {CONTACTS.map((group) => (
          <section key={group.category}>
            <h2 className={`text-sm font-semibold mb-2 ${group.labelColor}`}>
              {group.category}
            </h2>
            <div className="space-y-2">
              {group.entries.map((entry) => (
                <Card key={entry.number} className={`border ${group.color}`}>
                  <CardContent className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{entry.note}</p>
                    </div>
                    <a
                      href={`tel:${entry.number.replace(/\D/g, "")}`}
                      className="flex items-center gap-1.5 text-sm font-bold text-[#1E3A5F] hover:underline whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {entry.number}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <p className="text-center text-xs text-gray-400 pt-2 pb-4">
          Information may change rapidly during disaster response — verify with official sources.
        </p>
      </div>
    </div>
  )
}
