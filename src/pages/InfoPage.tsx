import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, FileText, ExternalLink, Send, Loader2, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

type CommunityUpdate = {
  id: string
  author_name: string
  island: string
  title: string
  body: string
  source_url: string | null
  created_at: string
}

const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam",
  saipan: "Saipan",
  tinian: "Tinian",
  rota: "Rota",
}

export default function InfoPage() {
  const [updates, setUpdates] = useState<CommunityUpdate[]>([])
  const [loadingUpdates, setLoadingUpdates] = useState(true)

  const [name, setName] = useState("")
  const [island, setIsland] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sourceUrl, setSourceUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .from("community_updates")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setUpdates((data as CommunityUpdate[]) ?? [])
        setLoadingUpdates(false)
      })
      .catch(() => setLoadingUpdates(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !island || !title.trim() || !body.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from("community_updates").insert({
        author_name: name.trim(),
        island,
        title: title.trim(),
        body: body.trim(),
        source_url: sourceUrl.trim() || null,
      } as any)
      if (error) throw error
      toast.success("Update submitted! It will appear after review.")
      setName("")
      setIsland("")
      setTitle("")
      setBody("")
      setSourceUrl("")
    } catch (err) {
      console.error(err)
      toast.error("Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-[#1E3A5F] hover:opacity-70 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Emergency Information</h1>
        </div>

        {/* COR 4 — JIC Release 31 */}
        <Card className="border-2 border-green-400 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg text-green-800">
                ✅ Guam Moved to COR 4 — Normal Operations Resume
              </CardTitle>
              <span className="text-xs text-gray-500 whitespace-nowrap">April 16, 2026</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>
              Governor Lou Leon Guerrero placed Guam in <strong>Condition of Readiness (COR) 4</strong> at 12 p.m. today.
              The National Weather Service has canceled the tropical storm warning and typhoon watch for Guam.
            </p>
            <div className="rounded-md bg-yellow-50 border border-yellow-300 p-3">
              <p className="font-semibold text-yellow-800 text-xs mb-1">⚠️ Stay Out of the Water</p>
              <p className="text-xs text-yellow-700">
                Life-threatening surf conditions remain. High rip current risk is in effect. Residents and visitors
                of Guam and CNMI should remain out of the water and away from shoreline trails.
              </p>
            </div>
            <div className="rounded-md bg-orange-50 border border-orange-200 p-3">
              <p className="font-semibold text-orange-800 text-xs mb-1">🔥 No-Burn Notice in Effect</p>
              <p className="text-xs text-orange-700">
                The Guam Fire Department has issued a No-Burn Notice. Refrain from all outdoor burning due to
                low water supply and high winds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="/docs/jic-release-31-cor4-apr16.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-green-800 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                JIC Release No. 31 (PDF)
              </a>
              <a
                href="https://ghs.guam.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-green-600 text-green-700 px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-green-50 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                GHS/OCD Website
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Healthcare Services Update — JIC 31 */}
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base text-[#1E3A5F]">Healthcare Services Update</CardTitle>
              <span className="text-xs text-gray-500 whitespace-nowrap">April 16, 2026</span>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-[#1E3A5F] mb-1">Clinics Open</p>
                <ul className="text-xs space-y-0.5 text-gray-600">
                  <li>IHP Clinic — Open</li>
                  <li>AC Micro Interventional Pain Clinic — Open at 12 p.m.</li>
                  <li>SDA Pharmacy — Regular patients + free Clinic With a Heart</li>
                  <li>Guam Surgicenter — Open tomorrow</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1E3A5F] mb-1">Pharmacies</p>
                <ul className="text-xs space-y-0.5 text-gray-600">
                  <li>Mega Drug 1 &amp; 2 — Open</li>
                  <li>Community Pharmacy 2 &amp; 3 — Open regular hours</li>
                  <li>Simply Rx — Open at 1 p.m.</li>
                  <li>ITC Pharmacy 1 — Open limited time</li>
                  <li>ITC Pharmacy 2 — Open regular hours</li>
                </ul>
              </div>
            </div>
            <div className="rounded-md bg-purple-50 border border-purple-200 p-3">
              <p className="text-xs font-semibold text-purple-800 mb-1">GBHWC Suicide &amp; Crisis Lifeline — 24/7</p>
              <p className="text-xs text-purple-700">
                Call or text <strong>988</strong>, or chat at{" "}
                <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="underline">988lifeline.org</a>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GPA Power Restoration */}
        <Card className="border border-yellow-300 bg-yellow-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base text-yellow-800">GPA Power Restoration Update</CardTitle>
              <span className="text-xs text-gray-500 whitespace-nowrap">April 16, 2026</span>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>North and south grid successfully linked back into a single loop (April 15)</li>
              <li>15 of 63 distribution circuits restored — including GMH, Tumon Hotel Row, Harmon Industrial Park, and the Airport</li>
              <li>Crews working 12-hour shifts, 24/7 restoration operations</li>
              <li>System demand at 35 MW (~20% normal) — expected to increase as restoration progresses</li>
            </ul>
            <p className="text-xs text-gray-500 pt-1">
              Down lines, blown transformers, low voltage? Call GPA 24-Hour Dispatch:{" "}
              <a href="tel:6714751472" className="font-bold text-yellow-800 hover:underline">(671) 475-1472</a>.
            </p>
            <a href="https://www.facebook.com/GuamPowerAuthority" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-yellow-800 hover:underline">
              <ExternalLink className="w-3 h-3" /> GPA Facebook
            </a>
          </CardContent>
        </Card>

        {/* GSWA Trash Collection */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base text-[#1E3A5F]">GSWA Trash Collection — Revised Schedule</CardTitle>
              <span className="text-xs text-gray-500 whitespace-nowrap">April 16–22, 2026</span>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-gray-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Monday customers:</strong> Collection on Thursday, April 16 (after COR 4)</li>
              <li><strong>Tuesday customers:</strong> Collection on Friday, April 17</li>
              <li><strong>Wednesday customers:</strong> Collection on Saturday, April 18</li>
              <li><strong>Thursday customers:</strong> Cancelled this week — resumes April 23</li>
              <li><strong>Recycle:</strong> Suspended until April 24; delayed one week through May</li>
            </ul>
            <p className="text-xs text-gray-500">
              Free dump at Residential Transfer Stations: April 16–22. Curbside debris collection not available — do not place storm debris at curbside.
            </p>
            <p className="text-xs">
              GSWA Customer Service:{" "}
              <a href="tel:6716463111" className="font-bold text-[#1E3A5F] hover:underline">671-646-3111</a>
            </p>
          </CardContent>
        </Card>

        {/* FEMA Emergency Declaration */}
        <Card className="border-2 border-[#1E3A5F]/20">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-lg text-[#1E3A5F]">
                President Approves Emergency Declaration for Guam
              </CardTitle>
              <span className="text-xs text-gray-500 whitespace-nowrap">April 12, 2026</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            <p>
              FEMA has mobilized nearly <strong>100 staff members</strong>, including R-IMAT 2
              deploying to Guam and MERS teams from Bothell and Denver, to coordinate federal
              disaster relief and provide emergency protective measures at <strong>75% federal funding</strong>.
            </p>
            <p>
              <strong>Andrew F. Grant</strong> has been named the Federal Coordinating Officer for
              federal response operations in the affected areas. Additional designations may be
              made at a later date if requested by the territory and warranted by the results of
              further damage assessments.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="/docs/fema-emergency-declaration-guam-2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-[#2a4f7a] transition"
              >
                <FileText className="w-3.5 h-3.5" />
                View Full Declaration (PDF)
              </a>
              <a
                href="https://www.fema.gov/press-release/20260412/president-donald-j-trump-approves-emergency-declaration-commonwealth"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#1E3A5F] text-[#1E3A5F] px-4 py-2 rounded-md text-xs font-semibold hover:bg-[#1E3A5F]/5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                FEMA.gov Source
              </a>
            </div>
          </CardContent>
        </Card>

        {/* About This Tool */}
        <Card className="border border-purple-200 bg-purple-50/50">
          <CardContent className="pt-5 space-y-3">
            <p className="text-sm text-gray-700">
              This tool was built <strong>mainly with Anthropic's Claude Code</strong> and has enabled
              rapid development to support our most vulnerable island communities for exactly this
              purpose — getting critical information to people when they need it most.
            </p>
            <a
              href="https://www.linkedin.com/posts/jordan-elizaga_guam-sinlaku-emergencyresponse-activity-7449282234555125760-lTZg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Read the story behind this project on LinkedIn
            </a>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1E3A5F]">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a href="tel:911" className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 hover:bg-red-100 transition">
                <span className="text-sm text-gray-600">Emergency</span>
                <span className="font-mono font-bold text-red-700">911</span>
              </a>
              <a href="tel:311" className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:bg-gray-50 transition">
                <span className="text-sm text-gray-600">Non-Emergency</span>
                <span className="font-mono font-bold text-[#1E3A5F]">311</span>
              </a>
              <a href="tel:18006213362" className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover:bg-gray-50 transition">
                <span className="text-sm text-gray-600">FEMA</span>
                <span className="font-mono font-bold text-[#1E3A5F]">1-800-621-3362</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Approved Community Updates */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1E3A5F]">Community Updates</h2>
          {loadingUpdates ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : updates.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No community updates yet. Be the first to share information below.</p>
          ) : (
            <div className="space-y-3">
              {updates.map((u) => (
                <Card key={u.id}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm">{u.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                        <MapPin className="w-3 h-3" />
                        {ISLAND_LABELS[u.island] ?? u.island}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{u.body}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                      <span>by {u.author_name}</span>
                      {u.source_url && (
                        <a href={u.source_url} target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> Source
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Submit Community Update */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#1E3A5F]">Share an Update</CardTitle>
            <p className="text-xs text-gray-500">
              Submit information to help your community. Updates are reviewed before publishing.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="info-name">Your name <span className="text-destructive">*</span></Label>
                  <Input id="info-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maria" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Island <span className="text-destructive">*</span></Label>
                  <Select value={island} onValueChange={setIsland}>
                    <SelectTrigger><SelectValue placeholder="Select island" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guam">Guam</SelectItem>
                      <SelectItem value="saipan">Saipan</SelectItem>
                      <SelectItem value="tinian">Tinian</SelectItem>
                      <SelectItem value="rota">Rota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-title">Title <span className="text-destructive">*</span></Label>
                <Input id="info-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water distribution at Dededo Gym" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-body">Details <span className="text-destructive">*</span></Label>
                <Textarea id="info-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share what you know — location, times, who to contact..." rows={4} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="info-source">Source URL <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input id="info-source" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="submit" disabled={submitting} className="w-full text-white" style={{ backgroundColor: "#1E3A5F" }}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit Update</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
