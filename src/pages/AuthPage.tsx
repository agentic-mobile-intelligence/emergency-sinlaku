import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2 } from "lucide-react"

interface AuthPageProps {
  onSignUp: (email: string, password: string, displayName: string) => Promise<unknown>
  onSignIn: (email: string, password: string) => Promise<unknown>
}

export default function AuthPage({ onSignUp, onSignIn }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "signup") {
        await onSignUp(email, password, displayName || email.split("@")[0])
      } else {
        await onSignIn(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          {{PAGE_TITLE}}
        </h1>
        <p className="text-[#555] text-xs uppercase tracking-[4px] mt-2">
          Sign in to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-[#666] text-xs uppercase tracking-widest">
              Display Name
            </Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-[#0a0a0a] border-[#1a1a1a] text-white h-12 rounded-lg focus:border-primary focus:ring-primary/20 placeholder:text-[#333]"
              placeholder="Your name"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[#666] text-xs uppercase tracking-widest">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#0a0a0a] border-[#1a1a1a] text-white h-12 rounded-lg focus:border-primary focus:ring-primary/20 placeholder:text-[#333]"
            placeholder="you@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[#666] text-xs uppercase tracking-widest">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-[#0a0a0a] border-[#1a1a1a] text-white h-12 rounded-lg focus:border-primary focus:ring-primary/20 placeholder:text-[#333]"
            placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 font-semibold text-sm uppercase tracking-widest rounded-lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login")
          setError("")
        }}
        className="mt-8 text-[#555] text-xs uppercase tracking-widest hover:text-white transition-colors"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  )
}
