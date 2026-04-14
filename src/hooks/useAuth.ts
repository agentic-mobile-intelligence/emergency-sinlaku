/**
 * useAuth — Clerk-based auth hook
 *
 * Provides a consistent interface for the rest of the app while
 * delegating to Clerk for session management.
 *
 * The returned `supabaseClient` is pre-configured to attach the Clerk
 * JWT (from the "supabase" JWT template) to every request, so Supabase
 * RLS policies using auth.jwt()->>'sub' work correctly.
 *
 * Setup required in Clerk Dashboard:
 *   JWT Templates → New template → Name: "supabase"
 *   Signing algorithm: HS256
 *   Signing key: paste Supabase project JWT secret
 *   Claims: { "sub": "{{user.id}}" }
 */

import { useMemo } from "react"
import { useUser, useClerk, useSession } from "@clerk/clerk-react"
import { createAuthClient } from "@/lib/supabase"

export function useAuth() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const { session } = useSession()

  const supabaseClient = useMemo(
    () =>
      createAuthClient(async () => {
        if (!session) return null
        return session.getToken({ template: "supabase" })
      }),
    [session]
  )

  return {
    // Normalised user shape — rest of app uses user.id and user.email
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
        }
      : null,

    // Profile-like object built from Clerk user data
    profile: user
      ? {
          id: user.id,
          clerk_user_id: user.id,
          display_name:
            user.fullName ??
            user.firstName ??
            user.primaryEmailAddress?.emailAddress ??
            "",
          avatar_url: user.imageUrl ?? null,
          created_at: user.createdAt?.toISOString() ?? "",
          role: "provider" as const,
        }
      : null,

    loading: !isLoaded,
    signOut,

    // Supabase client with Clerk JWT injected — use this for all authenticated writes
    supabaseClient,
  }
}
