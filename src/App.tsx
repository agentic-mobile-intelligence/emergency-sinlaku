import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import LandingPage from "@/pages/LandingPage"
import IslandPage from "@/pages/IslandPage"

const toasterProps = {
  theme: "dark" as const,
  toastOptions: {
    style: { background: "#111", border: "1px solid #222", color: "#fff" },
  },
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public pages — no auth required to browse */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/:island" element={<IslandPage />} />
          <Route path="/request-aid" element={<div className="p-8 text-center text-muted-foreground">Aid request form — coming soon</div>} />
          <Route path="/provider/register" element={<div className="p-8 text-center text-muted-foreground">Provider registration — coming soon</div>} />
          <Route path="/provider/dashboard" element={<div className="p-8 text-center text-muted-foreground">Provider dashboard — coming soon</div>} />
          <Route path="/admin" element={<div className="p-8 text-center text-muted-foreground">Admin dashboard — coming soon</div>} />
        </Routes>
      </BrowserRouter>
      <Toaster {...toasterProps} />
    </>
  )
}

export default App
