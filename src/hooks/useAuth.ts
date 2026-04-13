import { useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Tables } from "@/lib/database.types"

type Profile = Tables<"profiles">

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    return data
  }, [])

  useEffect(() => {
    let cancelled = false

    // Timeout: if auth check takes > 4s, show auth page
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setState((prev) => prev.loading ? { user: null, profile: null, loading: false } : prev)
      }
    }, 4000)

    const resolveUser = async (user: User | null) => {
      if (cancelled) return
      if (user) {
        try {
          const profile = await fetchProfile(user.id)
          if (!cancelled) setState({ user, profile, loading: false })
        } catch {
          if (!cancelled) setState({ user, profile: null, loading: false })
        }
      } else {
        if (!cancelled) setState({ user: null, profile: null, loading: false })
      }
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => resolveUser(session?.user ?? null))
      .catch(() => {
        if (!cancelled) setState({ user: null, profile: null, loading: false })
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolveUser(session?.user ?? null)
      }
    )

    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
    return data
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Pick<Profile, "display_name" | "avatar_url">>) => {
    if (!state.user) return
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", state.user.id)
      .select()
      .single()
    if (error) throw error
    setState((prev) => ({ ...prev, profile: data }))
    return data
  }

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
}
