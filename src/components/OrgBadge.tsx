import type { Database } from "@/lib/database.types"

type OrgCategory = Database["public"]["Enums"]["org_category"]

interface BadgeStyle {
  label: string
  bg: string
  text: string
  border: string
  icon: string
}

const BADGE_STYLES: Record<OrgCategory, BadgeStyle> = {
  uncategorized: {
    label: "Uncategorized",
    bg: "bg-gray-100",
    text: "text-gray-500",
    border: "border-gray-200",
    icon: "○",
  },
  federal_agency: {
    label: "Federal Agency",
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
    icon: "★",
  },
  national_ngo: {
    label: "National NGO",
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    icon: "✚",
  },
  local_government: {
    label: "Gov. Agency",
    bg: "bg-[#1E3A5F]/10",
    text: "text-[#1E3A5F]",
    border: "border-[#1E3A5F]/30",
    icon: "⚑",
  },
  local_ngo: {
    label: "Local NGO",
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    icon: "◆",
  },
  faith_based: {
    label: "Faith-Based",
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-300",
    icon: "✦",
  },
  community: {
    label: "Community Org",
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    icon: "●",
  },
}

interface OrgBadgeProps {
  category: OrgCategory
  verified?: boolean
  size?: "sm" | "xs"
}

export default function OrgBadge({ category, verified, size = "xs" }: OrgBadgeProps) {
  const style = BADGE_STYLES[category] ?? BADGE_STYLES.uncategorized
  const isUnverified = !verified
  const isUncategorized = category === "uncategorized"

  const textSize = size === "sm" ? "text-xs" : "text-[10px]"
  const px = size === "sm" ? "px-2 py-0.5" : "px-1.5 py-0"

  return (
    <span className={`inline-flex items-center gap-1 ${textSize} font-semibold ${px} rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      <span className="leading-none">{style.icon}</span>
      <span>{style.label}</span>
      {isUnverified && !isUncategorized && (
        <span className="text-[9px] opacity-60">(unverified)</span>
      )}
      {isUncategorized && (
        <span className="text-[9px] opacity-60">(unverified)</span>
      )}
    </span>
  )
}
