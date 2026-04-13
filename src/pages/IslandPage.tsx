import { useParams, useNavigate, Navigate } from "react-router-dom"
import { ArrowLeft, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

const islandMeta: Record<string, { name: string; center: [number, number]; zoom: number }> = {
  guam: { name: "Guam", center: [13.4443, 144.7937], zoom: 11 },
  saipan: { name: "Saipan", center: [15.1935, 145.7500], zoom: 12 },
  tinian: { name: "Tinian", center: [14.9989, 145.6367], zoom: 13 },
  rota: { name: "Rota", center: [14.1533, 145.2090], zoom: 13 },
}

export default function IslandPage() {
  const { island } = useParams<{ island: string }>()
  const navigate = useNavigate()

  const meta = island ? islandMeta[island] : null
  if (!meta) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold">{meta.name} Services</h1>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/request-aid")}>
              Request Aid
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/provider/register")}>
              I'm a Provider
            </Button>
          </div>
        </div>
      </header>

      {/* Main: Drawer + Map layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Drawer */}
        <aside className="w-full md:w-80 border-r border-border bg-card overflow-y-auto md:h-[calc(100vh-57px)]">
          <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-3 w-3" />
                Filter by need
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Food", "Shelter", "Water", "Medical", "Tarps", "Cleanup", "Clothing", "Transportation"].map(
                  (type) => (
                    <button
                      key={type}
                      className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Filter by status</div>
              <div className="flex gap-1.5">
                {["Active", "Planned", "Closed"].map((status) => (
                  <button
                    key={status}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Service cards placeholder */}
            <div className="space-y-2 pt-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Services
              </div>
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No services registered yet.
                <br />
                <button
                  onClick={() => navigate("/provider/register")}
                  className="text-primary underline underline-offset-2 mt-1 inline-block"
                >
                  Register as a provider
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Map area */}
        <div className="flex-1 bg-muted relative min-h-[400px] md:h-[calc(100vh-57px)]">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Map: {meta.name} ({meta.center[0].toFixed(2)}, {meta.center[1].toFixed(2)})
            <br />
            Leaflet integration pending
          </div>
        </div>
      </div>
    </div>
  )
}
