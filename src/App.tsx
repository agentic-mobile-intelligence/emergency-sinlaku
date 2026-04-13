import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import HomePage from "@/pages/HomePage"
import IslandPage from "@/pages/IslandPage"
import RequestAidPage from "@/pages/RequestAidPage"

const toasterProps = {
  theme: "dark" as const,
  toastOptions: {
    style: { background: "#111", border: "1px solid #222", color: "#fff" },
  },
}

const Placeholder = ({ label }: { label: string }) => (
  <div className="p-8 text-center text-muted-foreground">{label} — coming soon</div>
)

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<HomePage />} />

          {/* Island pages — explicit routes + dynamic catch-all */}
          <Route path="/guam"    element={<IslandPage />} />
          <Route path="/saipan"  element={<IslandPage />} />
          <Route path="/tinian"  element={<IslandPage />} />
          <Route path="/rota"    element={<IslandPage />} />
          <Route path="/:island" element={<IslandPage />} />
          <Route path="/request-aid" element={<RequestAidPage />} />
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
