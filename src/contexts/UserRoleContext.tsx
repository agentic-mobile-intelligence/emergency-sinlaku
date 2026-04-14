import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useUser, useSession } from "@clerk/clerk-react"
import { createAuthClient } from "@/lib/supabase"

interface UserRoleContextType {
  role: string | null
  isAdmin: boolean
  loading: boolean
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  isAdmin: false,
  loading: true,
})

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { session } = useSession()
  const [role, setRole] = useState<string | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)

  const client = useMemo(
    () =>
      createAuthClient(async () => {
        if (!session) return null
        return session.getToken({ template: "supabase" })
      }),
    [session],
  )

  useEffect(() => {
    if (!isLoaded) return
    if (!user || !session) {
      setRole(null)
      setRoleLoading(false)
      return
    }

    setRoleLoading(true)
    const email = user.primaryEmailAddress?.emailAddress ?? null
    const displayName =
      user.fullName ?? user.firstName ?? email ?? "User"

    // 1. Try to upsert profile (may fail if JWT not ready — that's OK)
    client
      .from("profiles")
      .upsert(
        {
          id: crypto.randomUUID(),
          clerk_user_id: user.id,
          display_name: displayName,
          avatar_url: user.imageUrl ?? null,
          email,
        },
        { onConflict: "clerk_user_id" },
      )
      .then(() => {})
      .catch(() => {})

    // 2. Read role separately (SELECT policy is public — always works)
    client
      .from("profiles")
      .select("role")
      .eq("clerk_user_id", user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role ?? "unverified")
        setRoleLoading(false)
      })
      .catch(() => {
        setRole("unverified")
        setRoleLoading(false)
      })
  }, [user?.id, isLoaded])

  return (
    <UserRoleContext.Provider
      value={{ role, isAdmin: role === "admin", loading: !isLoaded || roleLoading }}
    >
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  return useContext(UserRoleContext)
}
