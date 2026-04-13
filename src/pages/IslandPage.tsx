import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Filter, MapPin, Clock, Phone, ChevronDown, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import type { Tables } from "@/lib/database.types"
import { Constants } from "@/lib/database.types"

type Offering = Tables<"offerings"> & { organizations: Pick<Tables<"organizations">, "name" | "contact_phone" | "verified"> }

const BRAND = "#1E3A5F"

const islandMeta: Record<string, { name: string; center: [number, number]; zoom: number }> = {
  guam: { name: "Guam", center: [13.4443, 144.7937], zoom: 11 },
  saipan: { name: "Saipan", center: [15.185, 145.7545], zoom: 12 },
  tinian: { name: "Tinian", center: [15.003, 145.6367], zoom: 13 },
  rota: { name: "Rota", center: [14.154, 145.2124], zoom: 13 },
}

const SERVICE_COLORS: Record<string, string> = {
  shelter: "#DC2626",
  food: "#16A34A",
  water: "#2563EB",
  medical: "#9333EA",
  tarps: "#CA8A04",
  cleanup: "#0891B2",
  clothing: "#DB2777",
  transportation: "#EA580C",
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  planned: { label: "Planned", variant: "secondary" },
  at_capacity: { label: "At Capacity", variant: "destructive" },
  closed: { label: "Closed", variant: "outline" },
}

function createPinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

function FlyToIsland({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [map, center, zoom])
  return null
}

export default function IslandPage() {
  const { island } = useParams<{ island: string }>()
  const navigate = useNavigate()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(Constants.public.Enums.service_type))
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set(["active", "planned"]))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(true)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const meta = island ? islandMeta[island] : null
  if (!meta) return <Navigate to="/" replace />

  useEffect(() => {
    setLoading(true)
    supabase
      .from("offerings")
      .select("*, organizations(name, contact_phone, verified)")
      .eq("island", island as any)
      .then(({ data, error }) => {
        if (!error && data) setOfferings(data as Offering[])
        setLoading(false)
      })
  }, [island])

  const filtered = useMemo(
    () =>
      offerings.filter(
        (o) => activeTypes.has(o.service_type) && activeStatuses.has(o.status)
      ),
    [offerings, activeTypes, activeStatuses]
  )

  const toggleType = (t: string) =>
    setActiveTypes((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })

  const toggleStatus = (s: string) =>
    setActiveStatuses((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })

  const selectOffering = (id: string) => {
    setSelectedId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Emergency banner */}
      <div className="bg-red-700 text-white text-sm py-2 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-center">
          <span className="font-bold tracking-wide">EMERGENCY:</span>
          <a href="tel:911" className="hover:underline font-semibold">911</a>
          <a href="tel:311" className="hover:underline font-semibold">311</a>
          <a href="tel:18006213362" className="hover:underline font-semibold">FEMA: 1-800-621-3362</a>
        </div>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-blue-900/20 px-4 py-3" style={{ backgroundColor: BRAND }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-white hover:text-blue-200">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-semibold">Home</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white gap-1 text-sm">
                  {meta.name} <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.entries(islandMeta).map(([slug, m]) => (
                  <DropdownMenuItem key={slug} onClick={() => navigate(`/${slug}`)} className="cursor-pointer">
                    {m.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white min-h-[36px]" onClick={() => navigate("/request-aid")}>
              Request Aid
            </Button>
            <Button size="sm" variant="outline" className="text-xs border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white min-h-[36px]" onClick={() => navigate("/provider/register")}>
              I'm a Provider
            </Button>
          </div>
        </div>
      </header>

      {/* Main: drawer + map */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Mobile drawer toggle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="md:hidden fixed bottom-4 left-4 z-[1000] bg-white shadow-lg rounded-full p-3 border"
        >
          <Filter className="h-5 w-5" />
        </button>

        {/* Left drawer */}
        <aside
          className={`
            ${drawerOpen ? "translate-y-0" : "translate-y-full"}
            md:translate-y-0 transition-transform
            fixed bottom-0 left-0 right-0 max-h-[60vh] z-[999]
            md:static md:max-h-none md:z-auto
            w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white overflow-y-auto md:h-[calc(100vh-97px)]
            shadow-lg md:shadow-none rounded-t-2xl md:rounded-none
          `}
        >
          <div className="p-4 space-y-4">
            {/* Drag handle on mobile */}
            <div className="md:hidden flex justify-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Service type filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Filter className="h-3.5 w-3.5" /> Filter by need
              </div>
              <div className="space-y-1">
                {Constants.public.Enums.service_type.map((t) => (
                  <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
                    <Checkbox
                      checked={activeTypes.has(t)}
                      onCheckedChange={() => toggleType(t)}
                    />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERVICE_COLORS[t] }} />
                    <span className="text-sm capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status filters */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Filter by status</div>
              <div className="space-y-1">
                {["active", "planned", "at_capacity", "closed"].map((s) => (
                  <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
                    <Checkbox
                      checked={activeStatuses.has(s)}
                      onCheckedChange={() => toggleStatus(s)}
                    />
                    <span className="text-sm capitalize">{s.replace("_", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Service cards */}
            <div className="space-y-2 pt-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                {loading ? "Loading..." : `${filtered.length} service${filtered.length !== 1 ? "s" : ""}`}
              </div>

              {!loading && filtered.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                  No services registered yet.
                  <br />
                  <button onClick={() => navigate("/provider/register")} className="text-blue-600 underline mt-1">
                    Register as a provider
                  </button>
                </div>
              )}

              {filtered.map((o) => (
                <Card
                  key={o.id}
                  ref={(el) => { cardRefs.current[o.id] = el }}
                  className={`cursor-pointer transition-all ${selectedId === o.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                  onClick={() => selectOffering(o.id)}
                >
                  <CardContent className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{o.name}</div>
                        <div className="text-xs text-gray-500 truncate">{o.organizations?.name}</div>
                      </div>
                      <Badge
                        variant={STATUS_LABELS[o.status]?.variant ?? "outline"}
                        className="text-[10px] shrink-0"
                      >
                        {STATUS_LABELS[o.status]?.label ?? o.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SERVICE_COLORS[o.service_type] }} />
                        <span className="capitalize">{o.service_type}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{o.location_text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />{o.hours_text}
                    </div>
                    {o.organizations?.verified && (
                      <span className="text-[10px] text-green-700 font-medium">Verified</span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Emergency Resources */}
            <div className="space-y-2 pt-2 border-t">
              <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Emergency Resources
              </div>
              <div className="space-y-1.5 text-sm">
                <a href="https://www.metoc.navy.mil/jtwc/jtwc.html" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  JTWC — Joint Typhoon Warning Center
                </a>
                <a href="https://www.metoc.navy.mil/jtwc/products/wp0426web.txt" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  TC Warning Text (Latest)
                </a>
                <a href="https://www.metoc.navy.mil/jtwc/products/wp0426.gif" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  TC Warning Graphic
                </a>
                <a href="https://forecast.weather.gov/product.php?issuedby=PQ1&product=TCP&site=gum" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  NWS Tropical Cyclone Advisory
                </a>
                <a href="https://forecast.weather.gov/product.php?issuedby=PQ1&product=HLS&site=gum" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  NWS Hurricane Local Statement
                </a>
                <a href="https://www.weather.gov/gum/Cyclones" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  NWS Guam Cyclones
                </a>
                <a href="https://zoom.earth/storms/sinlaku-2026/" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  Zoom Earth — Sinlaku Live Tracker
                </a>
                <a href="https://ghs.guam.gov" target="_blank" rel="noopener" className="block text-blue-600 hover:underline">
                  GovGuam Homeland Security / OCD
                </a>
              </div>
            </div>

            {/* Request Aid CTA */}
            <Button className="w-full" style={{ backgroundColor: BRAND }} onClick={() => navigate("/request-aid")}>
              Request Aid
            </Button>
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 min-h-[400px] md:h-[calc(100vh-97px)]">
          <MapContainer
            center={meta.center}
            zoom={meta.zoom}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyToIsland center={meta.center} zoom={meta.zoom} />

            {filtered.map((o) => {
              if (!o.location_lat || !o.location_lng) return null
              return (
                <Marker
                  key={o.id}
                  position={[o.location_lat, o.location_lng]}
                  icon={createPinIcon(SERVICE_COLORS[o.service_type] ?? "#666")}
                  eventHandlers={{ click: () => selectOffering(o.id) }}
                >
                  <Popup>
                    <div className="text-sm space-y-1">
                      <div className="font-bold">{o.name}</div>
                      <div className="text-gray-600">{o.organizations?.name}</div>
                      <div className="capitalize">{o.service_type} &middot; {o.status}</div>
                      <div>{o.location_text}</div>
                      <div>{o.hours_text}</div>
                      {o.organizations?.contact_phone && (
                        <a href={`tel:${o.organizations.contact_phone}`} className="flex items-center gap-1 text-blue-600">
                          <Phone className="h-3 w-3" />{o.organizations.contact_phone}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
