import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending Review", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  REVIEWED: { label: "Reviewed", className: "bg-blue-50 text-blue-700 border-blue-200" },
  RESOLVED: { label: "Resolved", className: "bg-green-50 text-green-700 border-green-200" },
  DISMISSED: { label: "Dismissed", className: "bg-gray-100 text-gray-500 border-gray-200" },
}

export default function FeedbackViewPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>()
  const [feedback, setFeedback] = useState<any>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!feedbackId) return
    ;(supabase as any)
      .from("organization_feedback")
      .select("*")
      .eq("id", feedbackId)
      .single()
      .then(({ data, error }: any) => {
        if (error || !data) {
          setNotFound(true)
          return
        }
        setFeedback(data)
        ;(supabase as any)
          .from("organizations")
          .select("name")
          .eq("id", data.org_id)
          .single()
          .then(({ data: org }: any) => {
            if (org) setOrgName(org.name)
          })
      })
  }, [feedbackId])

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1E3A5F] mb-2">Feedback Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This feedback report doesn't exist or may have been removed.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const status = STATUS_BADGE[feedback.status] || STATUS_BADGE.PENDING
  const shortId = feedback.id.slice(0, 12)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        {/* Header card */}
        <Card className="mb-6 bg-gradient-to-br from-[#1E3A5F] to-[#2a4f7a] text-white border-0">
          <CardContent className="pt-5 pb-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-lg font-bold">{feedback.title}</h1>
                {orgName && (
                  <p className="text-sm text-white/70 mt-1">Regarding: {orgName}</p>
                )}
              </div>
              <Badge variant="outline" className={`${status.className} border`}>
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="mb-4">
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Reference ID</p>
                <p className="font-mono text-sm font-medium">{shortId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm">
                  {new Date(feedback.created_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm">{feedback.reviewer_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm">
                  {(feedback.feedback_type || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "General"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="mb-4">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Description</p>
            <p className="text-sm whitespace-pre-wrap">{feedback.description}</p>
          </CardContent>
        </Card>

        {/* Link to organization */}
        {feedback.org_id && orgName && (
          <div className="mb-4">
            <Link
              to={`/guam`}
              className="text-sm text-[#1E3A5F] hover:underline"
            >
              View {orgName} on the map →
            </Link>
          </div>
        )}

        {/* Admin response */}
        {feedback.admin_notes && (
          <Card className="mb-4 border-l-4 border-l-blue-500">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-semibold text-blue-700">Admin Response</p>
              </div>
              <p className="text-sm whitespace-pre-wrap">{feedback.admin_notes}</p>
              {feedback.reviewed_at && (
                <p className="text-xs text-muted-foreground mt-3">
                  Reviewed on{" "}
                  {new Date(feedback.reviewed_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
