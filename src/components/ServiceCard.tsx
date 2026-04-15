import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Clock, MapPin, Copy, Share2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { MapOffering } from "./MapComponent"
import CommunityConfirmations from "./CommunityConfirmations"

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
  planned: { bg: "bg-amber-100", text: "text-amber-800", label: "Planned" },
  closed: { bg: "bg-gray-100", text: "text-gray-600", label: "Closed" },
  at_capacity: { bg: "bg-orange-100", text: "text-orange-800", label: "At Capacity" },
}

const SERVICE_COLORS: Record<string, string> = {
  shelter: "bg-red-100 text-red-800",
  food: "bg-green-100 text-green-800",
  medical: "bg-blue-100 text-blue-800",
  water: "bg-yellow-100 text-yellow-800",
  cleanup: "bg-purple-100 text-purple-800",
  tarps: "bg-orange-100 text-orange-800",
  clothing: "bg-pink-100 text-pink-800",
  transportation: "bg-cyan-100 text-cyan-800",
}

interface ServiceCardProps {
  offering: MapOffering & {
    description?: string
    verified?: boolean
    whatsapp?: string
  }
  isExpanded: boolean
  onToggle: () => void
}

export default function ServiceCard({ offering, isExpanded, onToggle }: ServiceCardProps) {
  const status = STATUS_STYLES[offering.status] || STATUS_STYLES.closed
  const serviceColor = SERVICE_COLORS[offering.service_type] || "bg-gray-100 text-gray-800"

  const shareUrl = `${window.location.origin}/${offering.location_text?.toLowerCase().includes("saipan") ? "saipan" : "guam"}#${offering.id}`

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl)
    toast.success("Link copied!")
  }

  function handleWhatsAppShare() {
    const text = `${offering.name} — ${offering.organization_name}\n📍 ${offering.location_text}\n🕐 ${offering.hours_text || "Check listing"}\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <Card
      className={`cursor-pointer transition-all ${isExpanded ? "ring-2 ring-[#1E3A5F]" : "hover:border-gray-300"}`}
      onClick={onToggle}
    >
      <CardContent className="p-3">
        {/* Compact view — always shown */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{offering.name}</div>
            <div className="text-xs text-muted-foreground truncate">{offering.organization_name}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className={`text-[10px] px-1.5 ${serviceColor}`}>
              {offering.service_type}
            </Badge>
            <Badge variant="outline" className={`text-[10px] px-1.5 ${status.bg} ${status.text}`}>
              {status.label}
            </Badge>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {offering.location_text && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" /> {offering.location_text}
            </span>
          )}
          {offering.hours_text && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {offering.hours_text}
            </span>
          )}
        </div>

        {offering.verified && (
          <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200">
            ✓ Verified
          </Badge>
        )}

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
            {offering.description && (
              <p className="text-xs text-gray-600">{offering.description}</p>
            )}

            {offering.capacity_text && (
              <div className="text-xs text-gray-600">📊 Capacity: {offering.capacity_text}</div>
            )}

            {/* Contact */}
            <div className="flex flex-wrap gap-2">
              {offering.contact_phone && (
                <a href={`tel:${offering.contact_phone}`} className="inline-flex items-center gap-1 text-xs text-[#1E3A5F] font-semibold">
                  <Phone className="w-3 h-3" /> {offering.contact_phone}
                </a>
              )}
              {offering.whatsapp && (
                <a href={`https://wa.me/${offering.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs text-green-700 font-semibold">
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
              )}
            </div>

            {/* Community Confirmations */}
            <CommunityConfirmations offeringId={offering.id} />

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleWhatsAppShare}>
                <Share2 className="w-3 h-3 mr-1" /> Share
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCopyLink}>
                <Copy className="w-3 h-3 mr-1" /> Copy Link
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground ml-auto">
                <AlertTriangle className="w-3 h-3 mr-1" /> Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
