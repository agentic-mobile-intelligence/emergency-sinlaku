import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

const FEEDBACK_TYPES = [
  { value: "incorrect_info", label: "Incorrect Information" },
  { value: "missing_info", label: "Missing Information" },
  { value: "hours_wrong", label: "Hours are Wrong" },
  { value: "closed", label: "Organization is Closed/Moved" },
  { value: "phone_wrong", label: "Phone Number is Wrong" },
  { value: "address_wrong", label: "Address is Wrong" },
  { value: "other", label: "Other" },
]

const TYPE_TO_TITLE: Record<string, string> = {
  incorrect_info: "Incorrect Information",
  missing_info: "Missing Information",
  hours_wrong: "Hours are Wrong",
  closed: "Organization is Closed/Moved",
  phone_wrong: "Phone Number is Wrong",
  address_wrong: "Address is Wrong",
}

export default function FeedbackSubmitPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()

  const [orgName, setOrgName] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [reviewerPhone, setReviewerPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!orgId) return
    ;(supabase as any)
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single()
      .then(({ data }: any) => {
        if (data) setOrgName(data.name)
      })
  }, [orgId])

  const isOther = feedbackType === "other"
  const effectiveTitle = isOther ? title : TYPE_TO_TITLE[feedbackType] || title
  const canSubmit =
    feedbackType &&
    (isOther ? title.trim() : true) &&
    description.trim() &&
    reviewerName.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !orgId) return
    setSubmitting(true)

    const { data, error } = await (supabase as any)
      .from("organization_feedback")
      .insert({
        org_id: orgId,
        feedback_type: feedbackType,
        title: effectiveTitle,
        description: description.trim(),
        reviewer_name: reviewerName.trim(),
        reviewer_email: reviewerEmail.trim() || null,
        reviewer_phone: reviewerPhone.trim() || null,
      })
      .select("id")
      .single()

    setSubmitting(false)

    if (error || !data) {
      toast.error(error?.message || "Failed to submit feedback")
      return
    }

    navigate(`/feedback/submitted/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Link
          to={-1 as any}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-1">Report Feedback</h1>
        {orgName && (
          <p className="text-sm text-muted-foreground mb-6">
            for <span className="font-medium text-foreground">{orgName}</span>
          </p>
        )}

        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 mb-6">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Thank you for helping us maintain accurate information! Your feedback
            will be reviewed by our team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="type">Feedback Type</Label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isOther && (
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what's incorrect and what the correct information should be…"
              required
            />
          </div>

          <Card>
            <CardContent className="pt-4 space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Your Information
              </p>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Not made public.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={reviewerPhone}
                  onChange={(e) => setReviewerPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Not made public.</p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#1E3A5F] hover:bg-[#2a4f7a]"
            disabled={!canSubmit || submitting}
          >
            {submitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  )
}
