import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import EmergencyBanner from "@/components/EmergencyBanner"
import StickyHeader from "@/components/StickyHeader"
import IslandPage from "@/pages/IslandPage"
import RequestAidPage from "@/pages/RequestAidPage"
import ProviderRegisterPage from "@/pages/ProviderRegisterPage"
import ProviderDashboardPage from "@/pages/ProviderDashboardPage"
import CalendarPage from "@/pages/CalendarPage"
import AdminDashboard from "@/pages/AdminDashboard"

const toasterProps = {
  theme: "dark" as const,
  toastOptions: {
    style: { background: "#111", border: "1px solid #222", color: "#fff" },
  },
}

function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2 text-center">
        Mariana Islands Emergency Relief Directory
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">
        Find emergency services, support, and relief resources for communities affected by Supertyphoon Sinlaku.
      </p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <Link to="/guam" className="bg-[#1E3A5F] text-white rounded-xl p-6 text-center text-lg font-bold hover:bg-[#2a4f7a] transition">Guam</Link>
        <Link to="/saipan" className="bg-[#1E3A5F] text-white rounded-xl p-6 text-center text-lg font-bold hover:bg-[#2a4f7a] transition">Saipan</Link>
        <Link to="/tinian" className="bg-[#1E3A5F] text-white rounded-xl p-6 text-center text-lg font-bold hover:bg-[#2a4f7a] transition">Tinian</Link>
        <Link to="/rota" className="bg-[#1E3A5F] text-white rounded-xl p-6 text-center text-lg font-bold hover:bg-[#2a4f7a] transition">Rota</Link>
      </div>
      <p className="mt-4 text-xs text-gray-400">Select an island to view emergency services on the map</p>
      <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
        <p><a href="tel:911" className="text-[#DC2626] font-bold">911</a> Emergency &nbsp;|&nbsp; <a href="tel:311" className="text-[#1E3A5F] font-bold">311</a> Non-Emergency</p>
        <p>FEMA: <a href="tel:18006213362" className="text-[#1E3A5F] font-bold">1-800-621-3362</a></p>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <StickyHeader />
        <EmergencyBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:island" element={<IslandPage />} />
          <Route path="/request-aid" element={<RequestAidPage />} />
          <Route path="/provider/register" element={<ProviderRegisterPage />} />
          <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster {...toasterProps} />
    </>
  )
}

export default App
