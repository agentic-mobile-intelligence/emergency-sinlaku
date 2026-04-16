import { Link } from "react-router-dom"
import { Landmark, X } from "lucide-react"

interface Props {
  onDismiss: () => void
}

export default function GovOfficialsBanner({ onDismiss }: Props) {
  return (
    <div className="w-full bg-yellow-400 text-yellow-900 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Landmark className="w-3.5 h-3.5 shrink-0" />
        <p className="flex-1 text-xs font-semibold leading-snug">
          Government of Guam &amp; CNMI officials: reach out directly or self-register your agency — let residents know you're here.{" "}
          <Link
            to="/gov-officials"
            className="underline underline-offset-2 font-bold hover:opacity-70 transition"
          >
            Get listed →
          </Link>
        </p>
        <button
          onClick={onDismiss}
          className="shrink-0 text-yellow-800 hover:text-yellow-900 transition"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
