import { Link } from "react-router-dom"

const MARQUEE_LINKS = [
  { label: "911 Emergency", href: "tel:911" },
  { label: "311 Non-Emergency", href: "tel:311" },
  { label: "FEMA 1-800-621-3362", href: "tel:18006213362" },
  { label: "NWS Guam", href: "https://www.weather.gov/gum/" },
  { label: "NWS Facebook", href: "https://www.facebook.com/NWSGuam/" },
  { label: "GHS/OCD", href: "https://ghs.guam.gov/" },
  { label: "GHS/OCD Facebook", href: "https://www.facebook.com/GHSOCD/" },
  { label: "JRM Facebook", href: "https://www.facebook.com/jrmguam" },
  { label: "JTF-M Facebook", href: "https://www.facebook.com/1CdEchVcDs/" },
]

function MarqueeContent() {
  return (
    <>
      {MARQUEE_LINKS.map((link, i) => (
        <span key={i} className="inline-flex items-center gap-1 whitespace-nowrap">
          <a
            href={link.href}
            target={link.href.startsWith("tel:") ? undefined : "_blank"}
            rel={link.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
            className="underline hover:opacity-80"
          >
            {link.label}
          </a>
          <span className="mx-3 text-white/40">|</span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1 whitespace-nowrap">
        <Link to="/news" className="underline hover:opacity-80">
          Latest News
        </Link>
        <span className="mx-3 text-white/40">|</span>
      </span>
    </>
  )
}

export default function EmergencyBanner() {
  return (
    <div
      style={{ backgroundColor: "#DC2626" }}
      className="w-full py-2 text-white text-xs font-semibold overflow-hidden"
    >
      <div className="animate-marquee inline-flex whitespace-nowrap">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
