import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Leaflet (from john3-16 pattern)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const SERVICE_TYPE_COLORS: Record<string, string> = {
  shelter: "#DC2626",
  food: "#16A34A",
  medical: "#3B82F6",
  water: "#EAB308",
  cleanup: "#8B5CF6",
  tarps: "#F97316",
  clothing: "#EC4899",
  transportation: "#06B6D4",
}

const STATUS_OPACITY: Record<string, number> = {
  active: 1.0,
  planned: 0.6,
  closed: 0.3,
  at_capacity: 0.5,
}

function createServiceIcon(serviceType: string, status: string): L.DivIcon {
  const color = SERVICE_TYPE_COLORS[serviceType] || "#6B7280"
  const opacity = STATUS_OPACITY[status] || 0.6
  const statusRing = status === "active" ? "ring-2 ring-green-400" : status === "planned" ? "ring-2 ring-amber-400 ring-dashed" : ""

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="${statusRing}" style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; opacity: ${opacity};
      border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

export interface MapOffering {
  id: string
  name: string
  organization_name: string
  service_type: string
  status: string
  location_text: string
  hours_text: string | null
  capacity_text: string | null
  contact_phone: string | null
  latitude: number | null
  longitude: number | null
}

interface MapComponentProps {
  offerings: MapOffering[]
  selectedId: string | null
  onSelect: (id: string) => void
  center: [number, number]
  zoom: number
}

export default function MapComponent({ offerings, selectedId, onSelect, center, zoom }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current).setView(center, zoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when offerings change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => mapRef.current?.removeLayer(m))
    markersRef.current = {}

    // Add new markers
    const validOfferings = offerings.filter((o) => o.latitude && o.longitude)

    validOfferings.forEach((offering) => {
      const icon = createServiceIcon(offering.service_type, offering.status)
      const marker = L.marker([offering.latitude!, offering.longitude!], { icon })

      const statusLabel = offering.status === "active" ? "🟢 Active"
        : offering.status === "planned" ? "🟡 Planned"
        : offering.status === "at_capacity" ? "🟠 At Capacity"
        : "⚫ Closed"

      const popup = `
        <div style="min-width:200px;font-family:system-ui;font-size:13px;">
          <div style="font-weight:700;margin-bottom:4px;">${offering.name}</div>
          <div style="color:#666;font-size:11px;margin-bottom:6px;">${offering.organization_name}</div>
          <div style="margin-bottom:4px;">${statusLabel}</div>
          <div style="color:#666;font-size:12px;">📍 ${offering.location_text}</div>
          ${offering.hours_text ? `<div style="color:#666;font-size:12px;">🕐 ${offering.hours_text}</div>` : ""}
          ${offering.capacity_text ? `<div style="color:#666;font-size:12px;">📊 ${offering.capacity_text}</div>` : ""}
          ${offering.contact_phone ? `<div style="margin-top:6px;"><a href="tel:${offering.contact_phone}" style="color:#1E3A5F;font-weight:600;">📞 ${offering.contact_phone}</a></div>` : ""}
        </div>
      `

      marker.bindPopup(popup)
      marker.on("click", () => onSelect(offering.id))
      marker.addTo(mapRef.current!)
      markersRef.current[offering.id] = marker
    })

    // Fit bounds if we have markers
    if (validOfferings.length > 0) {
      const group = new L.FeatureGroup(Object.values(markersRef.current))
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [offerings, onSelect])

  // Highlight selected
  useEffect(() => {
    if (!mapRef.current || !selectedId) return
    const marker = markersRef.current[selectedId]
    if (marker) {
      marker.openPopup()
      const latlng = marker.getLatLng()
      mapRef.current.setView(latlng, 15)
    }
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: "400px" }} />
}
