import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft, Users, TrendingUp, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Search, Eye, EyeOff,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Disclaimer from "@/components/Disclaimer"

const ISLANDS = ["guam", "saipan", "tinian", "rota"] as const
const ISLAND_LABELS: Record<string, string> = {
  guam: "Guam", saipan: "Saipan", tinian: "Tinian", rota: "Rota",
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n)
}

interface Summary {
  total_donated: number
  total_allocated: number
  total_disbursed: number
  unallocated: number
  tracked: number
  untracked: number
}

interface IslandBreakdown {
  island: string
  earmarked: number
  allocated: number
  disbursed: number
}

interface FundLeader {
  id: string
  display_name: string
  org_name: string
  island: string
  address: string
  contact_email: string | null
  intended_services: string | null
  total_received: number
  total_disbursed: number
  balance: number
  org_verified: boolean
  status: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  receipt_url: string | null
  created_at: string
}

interface Donation {
  id: string
  donor_name: string | null
  amount: number
  island_earmark: string | null
  message: string | null
  created_at: string
}

export default function TransparencyPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [islandBreakdown, setIslandBreakdown] = useState<IslandBreakdown[]>([])
  const [leaders, setLeaders] = useState<FundLeader[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null)
  const [leaderTxns, setLeaderTxns] = useState<Record<string, Transaction[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null)
  const [lookupEmail, setLookupEmail] = useState("")
  const [lookupResults, setLookupResults] = useState<Donation[] | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: leadersData }, { data: donationsData }] = await Promise.all([
        supabase.from("fund_leader_balances").select("*").eq("status", "approved"),
        supabase
          .from("donations")
          .select("id, donor_name, amount, island_earmark, message, created_at")
          .eq("status", "confirmed")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(20),
      ])

      const leaderList = (leadersData ?? []) as FundLeader[]
      setLeaders(leaderList)
      setDonations((donationsData ?? []) as Donation[])

      // Compute summary from all confirmed donations
      const { data: allDonations } = await supabase
        .from("donations")
        .select("amount, island_earmark")
        .eq("status", "confirmed")
      const totalDonated = (allDonations ?? []).reduce((s, d) => s + Number(d.amount), 0)
      const totalAllocated = leaderList.reduce((s, l) => s + Number(l.total_received), 0)
      const totalDisbursed = leaderList.reduce((s, l) => s + Number(l.total_disbursed), 0)

      // Compute tracked vs untracked from transactions
      const { data: allTxns } = await supabase
        .from("fund_transactions")
        .select("amount, type, receipt_url")
      const disbursementsWithReceipt = (allTxns ?? [])
        .filter(t => t.type === "disbursement" && t.receipt_url)
        .reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
      const disbursementsWithoutReceipt = totalDisbursed - disbursementsWithReceipt

      setSummary({
        total_donated: totalDonated,
        total_allocated: totalAllocated,
        total_disbursed: totalDisbursed,
        unallocated: totalDonated - totalAllocated,
        tracked: totalAllocated - disbursementsWithoutReceipt,
        untracked: disbursementsWithoutReceipt + (totalDonated - totalAllocated),
      })

      // Island breakdown
      const breakdown = ISLANDS.map(island => {
        const earmarked = (allDonations ?? [])
          .filter(d => d.island_earmark === island)
          .reduce((s, d) => s + Number(d.amount), 0)
        const islandLeaders = leaderList.filter(l => l.island === island)
        const allocated = islandLeaders.reduce((s, l) => s + Number(l.total_received), 0)
        const disbursed = islandLeaders.reduce((s, l) => s + Number(l.total_disbursed), 0)
        return { island, earmarked, allocated, disbursed }
      })
      setIslandBreakdown(breakdown)

      setLoading(false)
    }
    load()
  }, [])

  async function toggleLeader(id: string) {
    if (expandedLeader === id) {
      setExpandedLeader(null)
      return
    }
    setExpandedLeader(id)
    if (!leaderTxns[id]) {
      const { data } = await supabase
        .from("fund_transactions")
        .select("id, type, amount, description, receipt_url, created_at")
        .eq("fund_leader_id", id)
        .order("created_at", { ascending: false })
      setLeaderTxns((prev) => ({ ...prev, [id]: (data ?? []) as Transaction[] }))
    }
  }

  async function lookupDonation() {
    if (!lookupEmail.trim()) return
    setLookupLoading(true)
    const { data } = await supabase
      .from("donations")
      .select("id, donor_name, amount, island_earmark, message, created_at")
      .eq("donor_email", lookupEmail.trim().toLowerCase())
      .order("created_at", { ascending: false })
    setLookupResults((data ?? []) as Donation[])
    setLookupLoading(false)
  }

  const filteredLeaders = selectedIsland
    ? leaders.filter(l => l.island === selectedIsland)
    : leaders

  const filteredDonations = selectedIsland
    ? donations.filter(d => d.island_earmark === selectedIsland)
    : donations

  return (
    <div className="min-h-[calc(100vh-88px)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <Link to="/how-to-help" className="text-[#1E3A5F] hover:opacity-70">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-[#1E3A5F]">Relief Fund Transparency</h1>
          </div>
          <p className="text-sm text-gray-600 ml-8">
            Every dollar donated is tracked here in real time. No exceptions.
          </p>
        </div>

        {/* Revenue Summary Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="pt-4 h-20 bg-gray-100 rounded" /></Card>
            ))}
          </div>
        ) : summary && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="border-[#1E3A5F]/20">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">Total Donated</p>
                  <p className="text-xl font-bold text-[#1E3A5F]">{fmt(summary.total_donated)}</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">Allocated to Leaders</p>
                  <p className="text-xl font-bold text-blue-700">{fmt(summary.total_allocated)}</p>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">Disbursed to Relief</p>
                  <p className="text-xl font-bold text-green-700">{fmt(summary.total_disbursed)}</p>
                </CardContent>
              </Card>
              <Card className={summary.unallocated > 0 ? "border-amber-300" : "border-gray-200"}>
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">Awaiting Allocation</p>
                  <p className="text-xl font-bold text-amber-600">{fmt(summary.unallocated)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tracked vs Untracked */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-green-300 bg-green-50/50">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye className="w-3.5 h-3.5 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">Tracked Dollars</p>
                  </div>
                  <p className="text-xl font-bold text-green-700">{fmt(summary.tracked)}</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Full audit trail: allocated + receipted disbursements
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-300 bg-orange-50/50">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <EyeOff className="w-3.5 h-3.5 text-orange-600" />
                    <p className="text-xs text-orange-700 font-medium">Untracked Dollars</p>
                  </div>
                  <p className="text-xl font-bold text-orange-700">{fmt(summary.untracked)}</p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    Awaiting allocation or missing receipts — goal is $0
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Unallocated notice */}
        {summary && summary.unallocated > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{fmt(summary.unallocated)} is received and confirmed but not yet assigned to a Fund Leader. This is normal — allocation happens as relief needs are verified.</span>
          </div>
        )}

        {/* Island Breakdown */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-[#1E3A5F]">By Island</h2>
            {selectedIsland && (
              <button
                onClick={() => setSelectedIsland(null)}
                className="text-xs text-[#1E3A5F] underline ml-2"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {islandBreakdown.map((ib) => {
              const isActive = selectedIsland === ib.island
              const maxVal = Math.max(ib.earmarked, 1)
              return (
                <button
                  key={ib.island}
                  onClick={() => setSelectedIsland(isActive ? null : ib.island)}
                  className="text-left"
                >
                  <Card className={`transition cursor-pointer hover:shadow-md ${isActive ? "border-[#1E3A5F] ring-2 ring-[#1E3A5F]/20" : "border-border"}`}>
                    <CardContent className="pt-4 pb-3 space-y-2">
                      <p className="text-sm font-bold text-[#1E3A5F]">{ISLAND_LABELS[ib.island]}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Earmarked</span>
                          <span className="font-medium">{fmt(ib.earmarked)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-[#1E3A5F] h-1.5 rounded-full" style={{ width: `${Math.min((ib.earmarked / maxVal) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Allocated</span>
                          <span className="font-medium text-blue-700">{fmt(ib.allocated)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Disbursed</span>
                          <span className="font-medium text-green-700">{fmt(ib.disbursed)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>
        </section>

        {/* Fund Leaders */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-[#1E3A5F]">
              Fund Leaders
              {selectedIsland && <span className="text-sm font-normal text-muted-foreground ml-1">— {ISLAND_LABELS[selectedIsland]}</span>}
            </h2>
            <span className="text-xs text-muted-foreground">({filteredLeaders.length} active)</span>
          </div>

          {filteredLeaders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {selectedIsland
                  ? `No approved fund leaders for ${ISLAND_LABELS[selectedIsland]} yet.`
                  : "No approved fund leaders yet."
                }{" "}
                <Link to="/how-to-help#leader" className="text-[#1E3A5F] underline">Apply as a Fund Leader</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLeaders.map((leader) => (
                <Card key={leader.id} className="border border-border overflow-hidden">
                  <button
                    className="w-full text-left"
                    onClick={() => toggleLeader(leader.id)}
                  >
                    <CardContent className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{leader.display_name}</p>
                            {leader.org_verified && (
                              <Badge variant="outline" className="text-xs text-green-700 border-green-300">Verified Org</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{ISLAND_LABELS[leader.island] ?? leader.island}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{leader.org_name}</p>
                          <p className="text-xs text-muted-foreground">{leader.address}</p>
                        </div>
                        <div className="text-right shrink-0 space-y-0.5">
                          <p className="text-xs text-muted-foreground">Received</p>
                          <p className="font-bold text-sm text-[#1E3A5F]">{fmt(leader.total_received)}</p>
                          <p className="text-xs text-green-600">{fmt(leader.total_disbursed)} disbursed</p>
                          {Number(leader.balance) > 0 && (
                            <p className="text-xs text-amber-600">{fmt(leader.balance)} in hand</p>
                          )}
                        </div>
                        <div className="self-center">
                          {expandedLeader === leader.id
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </CardContent>
                  </button>

                  {/* Expanded detail */}
                  {expandedLeader === leader.id && (
                    <div className="border-t border-border bg-gray-50 px-4 py-3 space-y-3">
                      {/* Leader profile */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Organization</p>
                          <p className="font-medium">{leader.org_name} {leader.org_verified && "(Verified)"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Island</p>
                          <p className="font-medium">{ISLAND_LABELS[leader.island] ?? leader.island}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Address</p>
                          <p className="font-medium">{leader.address}</p>
                        </div>
                        {leader.contact_email && (
                          <div>
                            <p className="text-muted-foreground">Contact</p>
                            <p className="font-medium">{leader.contact_email}</p>
                          </div>
                        )}
                      </div>
                      {leader.intended_services && (
                        <div className="text-xs">
                          <p className="text-muted-foreground">Intended Services</p>
                          <p className="font-medium">{leader.intended_services}</p>
                        </div>
                      )}

                      {/* Transaction log */}
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Transaction Log</h4>
                      {!leaderTxns[leader.id] ? (
                        <p className="text-xs text-muted-foreground">Loading...</p>
                      ) : leaderTxns[leader.id].length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No transactions recorded yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {leaderTxns[leader.id].map((tx) => (
                            <div key={tx.id} className="flex items-start justify-between gap-2 text-xs">
                              <div className="flex items-start gap-1.5">
                                <span className={`mt-0.5 rounded-full w-1.5 h-1.5 shrink-0 ${tx.type === "disbursement" ? "bg-green-500" : tx.type === "allocation" ? "bg-blue-500" : "bg-gray-400"}`} />
                                <div>
                                  <span className="text-gray-800">{tx.description}</span>
                                  <span className="text-muted-foreground ml-1">
                                    {new Date(tx.created_at).toLocaleDateString()}
                                  </span>
                                  {tx.receipt_url ? (
                                    <a href={tx.receipt_url} target="_blank" rel="noopener noreferrer"
                                      className="ml-1 inline-flex items-center gap-0.5 text-[#1E3A5F] underline">
                                      Receipt <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ) : tx.type === "disbursement" ? (
                                    <span className="ml-1 text-orange-500 italic">No receipt</span>
                                  ) : null}
                                </div>
                              </div>
                              <span className={`font-semibold shrink-0 ${tx.type === "disbursement" ? "text-green-700" : tx.type === "allocation" ? "text-blue-700" : "text-gray-600"}`}>
                                {tx.type === "disbursement" ? "-" : "+"}{fmt(Math.abs(Number(tx.amount)))}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recent donations feed */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-[#1E3A5F]">
              Recent Donations
              {selectedIsland && <span className="text-sm font-normal text-muted-foreground ml-1">— {ISLAND_LABELS[selectedIsland]}</span>}
            </h2>
          </div>
          {filteredDonations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {selectedIsland
                  ? `No confirmed donations for ${ISLAND_LABELS[selectedIsland]} yet.`
                  : "No confirmed donations yet."
                }{" "}
                <Link to="/donate" className="text-[#1E3A5F] underline">Be the first</Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-1.5">
              {filteredDonations.map((d) => (
                <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-border text-sm">
                  <div>
                    <span className="font-medium">{d.donor_name ?? "Anonymous"}</span>
                    {d.island_earmark && (
                      <span className="ml-2 text-xs text-muted-foreground">{ISLAND_LABELS[d.island_earmark] ?? d.island_earmark}</span>
                    )}
                    {d.message && <p className="text-xs text-muted-foreground italic mt-0.5">"{d.message}"</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#1E3A5F]">{fmt(Number(d.amount))}</p>
                    <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Donor Lookup */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#1E3A5F]" />
            <h2 className="text-lg font-bold text-[#1E3A5F]">Find Your Donation</h2>
          </div>
          <Card>
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm text-gray-600">Enter the email you used when donating to verify your donation was recorded.</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookupDonation()}
                  className="flex-1"
                />
                <Button onClick={lookupDonation} disabled={lookupLoading} className="bg-[#1E3A5F]">
                  {lookupLoading ? "Searching..." : "Look Up"}
                </Button>
              </div>
              {lookupResults !== null && (
                lookupResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No donations found for that email. If you recently donated, it may still be pending confirmation.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {lookupResults.map((d) => (
                      <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border text-sm">
                        <div>
                          <span className="font-medium">{d.donor_name ?? "Anonymous"}</span>
                          {d.island_earmark && (
                            <span className="ml-2 text-xs text-muted-foreground">{ISLAND_LABELS[d.island_earmark] ?? d.island_earmark}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#1E3A5F]">{fmt(Number(d.amount))}</p>
                          <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="bg-[#1E3A5F] text-white rounded-xl p-6 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 mx-auto opacity-80" />
          <h3 className="font-bold text-lg">Every dollar is tracked here.</h3>
          <p className="text-sm text-white/80">Your donation appears on this page once confirmed. Nothing is hidden.</p>
          <Link
            to="/donate"
            className="inline-block bg-white text-[#1E3A5F] font-bold px-6 py-2.5 rounded-lg hover:bg-gray-100 transition"
          >
            Donate Now
          </Link>
        </div>

        {/* Disclaimer + footer */}
        <Disclaimer />

        <p className="text-xs text-center text-gray-400 pb-4">
          Last updated in real time. Questions? <a href="mailto:admin@guahan.tech" className="underline">admin@guahan.tech</a>
        </p>
      </div>
    </div>
  )
}
