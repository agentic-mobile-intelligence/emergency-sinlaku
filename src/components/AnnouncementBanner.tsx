import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { X, Megaphone, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Announcement {
  id: string
  message: string
  action_label: string | null
  action_url: string | null
  priority: number
}

function isScamAlert(msg: string) {
  return /scam|fraud|impersonat/i.test(msg)
}

function AnnouncementItem({
  announcement,
  onDismiss,
}: {
  announcement: Announcement
  onDismiss: () => void
}) {
  const scam = isScamAlert(announcement.message)
  const isExternal = announcement.action_url?.startsWith("http")

  return (
    <div className={scam ? "bg-[#DC2626] text-white px-4 py-2.5" : "bg-[#1E3A5F] text-white px-4 py-2.5"}>
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        {scam
          ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-white/80" />
          : <Megaphone className="w-4 h-4 mt-0.5 shrink-0 text-white/70" />
        }
        <p className="flex-1 text-xs leading-relaxed">
          {scam && (
            <span className="inline-block bg-white text-[#DC2626] font-black text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded mr-2 leading-none align-middle">
              Scam Alert
            </span>
          )}
          {announcement.message}
          {announcement.action_url && announcement.action_label && (
            <>
              {" — "}
              {isExternal ? (
                <a
                  href={announcement.action_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  {announcement.action_label}
                </a>
              ) : (
                <Link to={announcement.action_url} className="underline font-semibold">
                  {announcement.action_label}
                </Link>
              )}
            </>
          )}
        </p>
        <button
          onClick={onDismiss}
          className="text-white/60 hover:text-white transition shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, message, action_label, action_url, priority")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data)
      })
  }, [])

  const visible = announcements.filter((a) => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div>
      {visible.map((a) => (
        <AnnouncementItem
          key={a.id}
          announcement={a}
          onDismiss={() => setDismissed((prev) => new Set([...prev, a.id]))}
        />
      ))}
    </div>
  )
}
