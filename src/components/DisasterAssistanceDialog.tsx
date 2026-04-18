import { useState } from "react"
import { ExternalLink, ShieldCheck, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  /** Optional className forwarded to the trigger button */
  className?: string
  /** Full-width layout (default true in sidebar context) */
  fullWidth?: boolean
}

export default function DisasterAssistanceDialog({ className = "", fullWidth = false }: Props) {
  const [open, setOpen] = useState(false)

  function handleContinue() {
    window.open("https://www.disasterassistance.gov/", "_blank", "noopener,noreferrer")
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`
          flex items-center justify-center gap-2
          bg-[#112E51] hover:bg-[#1a3f6f] active:bg-[#0d2340]
          text-white font-bold text-sm
          rounded-lg px-4 py-2.5 transition
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
      >
        {/* FEMA star seal mark */}
        <span className="text-base leading-none">★</span>
        <span>FEMA Disaster Assistance</span>
        <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
      </button>

      {/* Redirect dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">

          {/* FEMA header band */}
          <div className="bg-[#112E51] px-5 pt-5 pb-4">
            <div className="flex items-center gap-2.5 mb-3">
              {/* Simulated FEMA seal */}
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <span className="text-[#112E51] font-black text-xs leading-none text-center">FEMA</span>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">DisasterAssistance.gov</p>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Official U.S. Government Website</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-md px-2.5 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <span className="text-white/80 text-[10px] font-mono">disasterassistance.gov</span>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base">Leaving Sinlaku Relief Directory</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-600 leading-relaxed">
              You're being redirected to <span className="font-semibold text-[#112E51]">DisasterAssistance.gov</span> — the official FEMA portal to apply for federal disaster assistance, including housing, medical, and personal property grants.
            </p>

            {/* What you can do there */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-3.5 py-3 space-y-1.5 text-xs text-blue-900">
              <p className="font-semibold text-[11px] uppercase tracking-wide text-blue-600 mb-1">Available at DisasterAssistance.gov</p>
              {[
                "Apply for FEMA individual assistance",
                "Check application status",
                "Upload documents & appeal decisions",
                "Find disaster-specific programs",
              ].map((item) => (
                <div key={item} className="flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5">›</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleContinue}
                className="flex-1 bg-[#112E51] hover:bg-[#1a3f6f] text-white text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Continue to DisasterAssistance.gov
              </Button>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>

            <p className="text-center text-[10px] text-gray-400">
              <AlertTriangle className="inline w-3 h-3 mr-0.5 text-amber-400" />
              Never pay a fee to apply — FEMA assistance is free.
            </p>
          </div>

        </DialogContent>
      </Dialog>
    </>
  )
}
