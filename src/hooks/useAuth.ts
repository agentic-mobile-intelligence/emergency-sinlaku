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
 *
 * Role is read from the profiles table via UserRoleContext (single upsert
 * per session). socials@guahan.tech is auto-promoted to admin by a DB trigger.
 */

import { useMemo } from "react"
import { useUser, useClerk, useSession } from "@clerk/clerk-react"
import { createAuthClient } from "@/lib/supabase"
import { useUserRole } from "@/contexts/UserRoleContext"

export function useAuth() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const { session } = useSession()
  const { role, isAdmin } = useUserRole()

  const supabaseClient = useMemo(
    () =>
      createAuthClient(async () => {
        if (!session) return null
        try {
          return await session.getToken({ template: "supabase" })
        } catch {
          // JWT template "supabase" may not exist in dev instance — fall back to anon key
          console.warn("Clerk: failed to get supabase JWT — using anon key (reads only)")
          return null
        }
      }),
    [session],
  )

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? "",
        }
      : null,

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
          role: role ?? "unverified",
        }
      : null,

    loading: !isLoaded,
    role,
    isAdmin,
    signOut,

    // Supabase client with Clerk JWT injected — use this for all authenticated writes
    supabaseClient,
  }
}
