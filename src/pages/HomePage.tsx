import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

interface Props {
  user: User
  profile: Profile | null
}

export default function HomePage({ user, profile }: Props) {
  const navigate = useNavigate()

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome{profile?.display_name ? `, ${profile.display_name}` : ""}</CardTitle>
          <CardDescription>
            This is a starter app built with the Baku template.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Replace this page with your app's main content. The auth flow,
            Supabase client, React Query, and shadcn/ui components are all
            wired up and ready to go.
          </p>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            View Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
