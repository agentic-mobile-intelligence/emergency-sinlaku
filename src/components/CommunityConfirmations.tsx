import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { MessageSquare, Send, Loader2, Eye, EyeOff, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { moderateContent, checkRateLimit } from "@/lib/moderation"

type Confirmation = {
  id: string
  author_name: string | null
  is_anonymous: boolean
  message: string
  created_at: string
}

export default function CommunityConfirmations({ offeringId }: { offeringId: string }) {
  const { user, isLoaded } = useUser()
  const [confirmations, setConfirmations] = useState<Confirmation[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .from("community_confirmations")
      .select("id, author_name, is_anonymous, message, created_at")
      .eq("offering_id", offeringId)
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setConfirmations((data as Confirmation[]) ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [offeringId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Moderation gate
    const check = moderateContent(message)
    if (!check.ok) {
      toast.error(check.reason!)
      return
    }

    // Rate limit (1 per offering per session)
    if (!checkRateLimit(offeringId)) {
      toast.error("You've already submitted a confirmation for this service.")
      return
    }

    setSubmitting(true)
    try {
      const authorName = !isAnonymous && user
        ? (user.fullName ?? user.firstName ?? user.primaryEmailAddress?.emailAddress ?? "Community Member")
        : null

      const { error } = await supabase.from("community_confirmations").insert({
        offering_id: offeringId,
        author_name: authorName,
        is_anonymous: isAnonymous || !user,
        clerk_user_id: user?.id ?? null,
        message: message.trim(),
      } as any)
      if (error) throw error

      // Add to local state
      setConfirmations((prev) => [{
        id: crypto.randomUUID(),
        author_name: authorName,
        is_anonymous: isAnonymous || !user,
        message: message.trim(),
        created_at: new Date().toISOString(),
      }, ...prev])

      setMessage("")
      setShowForm(false)
      toast.success("Confirmation posted!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          Community ({confirmations.length})
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-[#1E3A5F] font-semibold hover:underline"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 p-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I went there today, they had water and tarps"
            className="text-xs min-h-[60px] bg-white"
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoaded && user ? (
                <>
                  <Switch
                    checked={!isAnonymous}
                    onCheckedChange={(v) => setIsAnonymous(!v)}
                  />
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    {isAnonymous
                      ? <><EyeOff className="w-3 h-3" /> Anonymous</>
                      : <><Eye className="w-3 h-3" /> {user.firstName ?? "Public"}</>
                    }
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Anonymous
                </span>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !message.trim()}
              className="h-7 text-xs"
              style={{ backgroundColor: "#1E3A5F" }}
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Send className="w-3 h-3 mr-1" /> Post</>}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400">{message.length}/500</p>
        </form>
      )}

      {/* Confirmations list */}
      {loading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : confirmations.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No community confirmations yet. Be the first!</p>
      ) : (
        <div className="space-y-1.5">
          {confirmations.map((c) => (
            <div key={c.id} className="rounded-md bg-gray-50 border border-gray-100 px-2.5 py-2">
              <p className="text-xs text-gray-700">{c.message}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                <span>{c.is_anonymous ? "Anonymous" : (c.author_name ?? "Community Member")}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {timeAgo(c.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
