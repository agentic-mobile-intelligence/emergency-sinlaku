/**
 * Simple client-side content moderation gate.
 * Blocks obvious spam, hate speech, and profanity before submission.
 * Not exhaustive — server-side moderation should supplement this.
 *
 * Reference: https://www.frontiersin.org/articles/10.3389/frai.2021.788220
 */

// Slurs, hate speech, profanity — lowercase patterns
const BLOCKED_PATTERNS = [
  // Profanity
  /\bf+u+c+k+/i, /\bs+h+i+t+/i, /\ba+s+s+h+o+l+e/i, /\bb+i+t+c+h/i,
  /\bd+a+m+n/i, /\bc+u+n+t/i, /\bd+i+c+k/i, /\bp+u+s+s+y/i,
  // Slurs (abbreviated to avoid storing full list)
  /\bn+i+g+g/i, /\bf+a+g+g/i, /\br+e+t+a+r+d/i, /\bk+i+k+e/i,
  /\bs+p+i+c+k?$/i, /\bc+h+i+n+k/i,
  // Spam patterns
  /\b(buy|sell|discount|offer|click here|free money|bitcoin|crypto)\b/i,
  /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i, // suspicious TLDs
  /(.)\1{5,}/, // repeated characters (aaaaaaa)
  /\b\d{10,}\b/, // long number strings (phone spam)
]

// Minimum content requirements
const MIN_LENGTH = 3
const MAX_LENGTH = 500

export type ModerationResult = {
  ok: boolean
  reason?: string
}

export function moderateContent(text: string): ModerationResult {
  const trimmed = text.trim()

  if (trimmed.length < MIN_LENGTH) {
    return { ok: false, reason: "Message is too short." }
  }

  if (trimmed.length > MAX_LENGTH) {
    return { ok: false, reason: `Message must be under ${MAX_LENGTH} characters.` }
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { ok: false, reason: "Message contains inappropriate content. Please revise." }
    }
  }

  // All caps check (shouting)
  const letters = trimmed.replace(/[^a-zA-Z]/g, "")
  if (letters.length > 10 && letters === letters.toUpperCase()) {
    return { ok: false, reason: "Please don't use all caps." }
  }

  return { ok: true }
}

// Rate limit: one confirmation per offering per session
const submitted = new Set<string>()

export function checkRateLimit(offeringId: string): boolean {
  if (submitted.has(offeringId)) return false
  submitted.add(offeringId)
  return true
}
