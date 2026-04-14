import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { X, Megaphone } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Announcement {
  id: string
  message: string
  action_label: string | null
  action_url: string | null
  priority: number
}

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, message, action_label, action_url, priority")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setAnnouncement(data)
      })
  }, [])

  if (!announcement || dismissed === announcement.id) return null

  const isExternal = announcement.action_url?.startsWith("http")

  return (
    <div className="bg-[#1E3A5F] text-white px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-start gap-3">
        <Megaphone className="w-4 h-4 mt-0.5 shrink-0 text-white/70" />
        <p className="flex-1 text-xs leading-relaxed">
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
                  {announcement.action_label} →
                </a>
              ) : (
                <Link to={announcement.action_url} className="underline font-semibold">
                  {announcement.action_label} →
                </Link>
              )}
            </>
          )}
        </p>
        <button
          onClick={() => setDismissed(announcement.id)}
          className="text-white/60 hover:text-white transition shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
