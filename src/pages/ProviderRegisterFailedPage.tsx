import { useNavigate, useLocation } from "react-router-dom"
import { AlertTriangle, MessageCircle, Camera, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const SUPPORT_WHATSAPP = "+16719695678"
const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}`

export default function ProviderRegisterFailedPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const errorMsg = (location.state as { error?: string } | null)?.error

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-destructive/90 backdrop-blur-sm border-b border-destructive/50 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            <span className="text-sm font-bold text-destructive-foreground uppercase tracking-wide">
              Typhoon Sinlaku Relief
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10">
        <div className="w-full max-w-lg space-y-6">

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Having trouble registering?</h1>
            <p className="text-sm text-muted-foreground">
              No problem — we can help you get listed manually.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="font-semibold text-sm">Contact us on WhatsApp</p>
                <p className="text-xs text-muted-foreground">{SUPPORT_WHATSAPP} — GovGuam OCD Support</p>
              </div>
            </div>

            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-support-btn"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </Button>
            </a>

            <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2.5 flex gap-2 text-xs text-amber-800">
              <Camera className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                <strong>Tip:</strong> Take a screenshot of this page and send it via WhatsApp so we can
                see the error and help you faster.
              </span>
            </div>
          </div>

          {/* Anonymous fallback */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
            <p className="font-semibold text-sm">Or submit your service anonymously</p>
            <p className="text-xs text-muted-foreground">
              No account needed. Fill in a short form and our team will manually review and add
              your service to the directory.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate("/support/anonymous")}
              data-testid="anonymous-submit-link"
            >
              Submit anonymously <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/provider/register")}
            className="text-sm text-muted-foreground hover:underline w-full text-center"
          >
            ← Try registering again
          </button>
        </div>
      </main>
    </div>
  )
}
