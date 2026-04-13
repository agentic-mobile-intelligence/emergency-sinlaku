import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/useAuth"
import AuthPage from "@/pages/AuthPage"
import HomePage from "@/pages/HomePage"
import ProfilePage from "@/pages/ProfilePage"

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="text-sm font-bold tracking-wide uppercase">
          {{PAGE_TITLE}}
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-xs text-muted-foreground uppercase tracking-[4px] animate-pulse">
        Loading
      </div>
    </div>
  )
}

const toasterProps = {
  theme: "dark" as const,
  toastOptions: {
    style: { background: "#111", border: "1px solid #222", color: "#fff" },
  },
}

function App() {
  const { user, profile, loading, signUp, signIn, signOut, updateProfile } = useAuth()

  if (loading) return <LoadingScreen />

  if (!user) {
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<AuthPage onSignUp={signUp} onSignIn={signIn} />} />
          </Routes>
        </BrowserRouter>
        <Toaster {...toasterProps} />
      </>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <AppLayout>
              <HomePage user={user} profile={profile} />
            </AppLayout>
          } />
          <Route path="/profile" element={
            <AppLayout>
              <ProfilePage
                profile={profile}
                onSignOut={signOut}
                onUpdateProfile={updateProfile}
              />
            </AppLayout>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster {...toasterProps} />
    </>
  )
}

export default App
