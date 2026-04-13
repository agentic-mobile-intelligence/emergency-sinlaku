import { useNavigate } from "react-router-dom"
import { Phone, AlertTriangle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const islands = [
  { slug: "guam", name: "Guam", description: "Hagatna & surrounding villages" },
  { slug: "saipan", name: "Saipan", description: "Capital & northern villages" },
  { slug: "tinian", name: "Tinian", description: "San Jose & surrounding areas" },
  { slug: "rota", name: "Rota", description: "Songsong & surrounding areas" },
] as const

const emergencyContacts = [
  { label: "Emergency", number: "911" },
  { label: "Non-Emergency", number: "311" },
  { label: "FEMA", number: "1-800-621-3362" },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
              Typhoon Sinlaku Relief
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
              onClick={() => navigate("/request-aid")}
            >
              Request Aid
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-destructive-foreground/30 text-destructive-foreground hover:bg-destructive-foreground/10"
              onClick={() => navigate("/provider/register")}
            >
              I'm a Provider
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Mariana Islands Emergency Relief Directory
            </h1>
            <p className="text-muted-foreground text-lg">
              Find emergency services, support, and relief resources for communities
              affected by Supertyphoon Sinlaku.
            </p>
          </div>

          {/* Island Buttons */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
              Select your island
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {islands.map((island) => (
                <button
                  key={island.slug}
                  onClick={() => navigate(`/${island.slug}`)}
                  className="group relative rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  <div className="text-lg font-semibold">{island.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {island.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <Card className="bg-card/50 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  Emergency Contacts
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {emergencyContacts.map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number.replace(/-/g, "")}`}
                    className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="text-muted-foreground">{contact.label}:</span>
                    <span className="font-mono font-semibold">{contact.number}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          Built with <Heart className="h-3 w-3 text-destructive" /> by Guahan.TECH for the Mariana Islands
        </div>
      </footer>
    </div>
  )
}
