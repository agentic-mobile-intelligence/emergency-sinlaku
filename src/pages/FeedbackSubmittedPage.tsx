import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { CheckCircle2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function FeedbackSubmittedPage() {
  const { feedbackId } = useParams<{ feedbackId: string }>()
  const [feedback, setFeedback] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!feedbackId) return
    ;(supabase as any)
      .from("organization_feedback")
      .select("id, title, feedback_type, status, created_at")
      .eq("id", feedbackId)
      .single()
      .then(({ data }: any) => {
        if (data) setFeedback(data)
      })
  }, [feedbackId])

  const trackingUrl = `${window.location.origin}/feedback/view/${feedbackId}`
  const shortId = feedbackId?.slice(0, 8) || ""

  function handleCopy() {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Feedback Submitted!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for helping us keep our directory accurate. Our team will review
          your report.
        </p>

        {feedback && (
          <Card className="text-left mb-6">
            <CardContent className="pt-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Reference ID</p>
                  <p className="font-mono font-bold text-sm">{shortId}</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending Review
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{feedback.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm">
                  {new Date(feedback.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2 mb-8">
          <p className="text-sm font-medium text-left">Tracking Link (no login required)</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={trackingUrl}
              className="text-xs font-mono bg-muted"
            />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 text-left">Copied!</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button asChild variant="default" className="flex-1 bg-[#1E3A5F] hover:bg-[#2a4f7a]">
            <Link to={`/feedback/view/${feedbackId}`}>View Feedback</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
