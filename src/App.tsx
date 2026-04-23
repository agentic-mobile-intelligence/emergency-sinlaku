import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import EmergencyBanner from "@/components/EmergencyBanner"
import StickyHeader from "@/components/StickyHeader"
import IslandPage from "@/pages/IslandPage"
import RequestAidPage from "@/pages/RequestAidPage"
import ProviderRegisterPage from "@/pages/ProviderRegisterPage"
import ProviderDashboardPage from "@/pages/ProviderDashboardPage"
import ProviderRegisterFailedPage from "@/pages/ProviderRegisterFailedPage"
import AnonymousSupportPage from "@/pages/AnonymousSupportPage"
import CalendarPage from "@/pages/CalendarPage"
import AdminDashboard from "@/pages/AdminDashboard"
import LoginPage from "@/pages/LoginPage"
import ContributePage from "@/pages/ContributePage"
import VolunteerPage from "@/pages/VolunteerPage"
import VolunteerSheetsPage from "@/pages/VolunteerSheetsPage"
import VolunteerLeaderPage from "@/pages/VolunteerLeaderPage"
import InfoPage from "@/pages/InfoPage"
import EmergencyContactsPage from "@/pages/EmergencyContactsPage"
import NewsPage from "@/pages/NewsPage"
import OrgMembersPage from "@/pages/OrgMembersPage"
import DonatePage from "@/pages/DonatePage"
import ArchivedOrgsPage from "@/pages/ArchivedOrgsPage"
import AnnouncementBanner from "@/components/AnnouncementBanner"
import GovOfficialsBanner from "@/components/GovOfficialsBanner"
import VolunteerStats from "@/components/VolunteerStats"
import Disclaimer from "@/components/Disclaimer"
import HowToHelpPage from "@/pages/HowToHelpPage"
import DisasterAssistanceDialog from "@/components/DisasterAssistanceDialog"
import TransparencyPage from "@/pages/TransparencyPage"
import InstructionsPage from "@/pages/InstructionsPage"
import GovOfficialsPage from "@/pages/GovOfficialsPage"
import FundLeaderApplyPage from "@/pages/FundLeaderApplyPage"
import FeedbackSubmitPage from "@/pages/FeedbackSubmitPage"
import FeedbackSubmittedPage from "@/pages/FeedbackSubmittedPage"
import FeedbackViewPage from "@/pages/FeedbackViewPage"

const toasterProps = {
  theme: "dark" as const,
  toastOptions: {
    style: { background: "#111", border: "1px solid #222", color: "#fff" },
  },
}

function LandingPage() {
  const [govBannerDismissed, setGovBannerDismissed] = useState(false)

  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center justify-center p-6">
      {/* Announcement banner — above title */}
      <div className="w-full max-w-md mb-2">
        <AnnouncementBanner />
      </div>

      {/* Gov officials yellow banner — dismissible, resets on navigation */}
      {!govBannerDismissed && (
        <div className="w-full max-w-md mb-4">
          <GovOfficialsBanner onDismiss={() => setGovBannerDismissed(true)} />
        </div>
      )}

      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2 text-center">
        Guam, and the Commonwealth of the Northern Mariana Islands (CNMI) Emergency Relief Directory
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

      {/* Getting Started */}
      <div className="mt-8 w-full max-w-md">
        <Link
          to="/instructions"
          className="flex items-center justify-between w-full border-2 border-[#1E3A5F] text-[#1E3A5F] font-bold text-sm rounded-lg px-4 py-3 hover:bg-[#1E3A5F]/5 transition"
        >
          <span>Getting Started</span>
          <span className="text-[#1E3A5F]/60">→</span>
        </Link>
      </div>

      {/* Volunteer CTA */}
      <div className="mt-3 w-full max-w-md rounded-xl border-2 border-[#1E3A5F] bg-[#1E3A5F]/5 p-5">
        <p className="text-sm font-semibold text-[#1E3A5F] mb-1">🙋 Want to help?</p>
        <p className="text-xs text-gray-600 mb-3">
          Sign up to volunteer with relief organizations. No account required.
        </p>
        <div className="flex gap-2">
          <Link
            to="/volunteer/sheets"
            className="flex-1 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg py-2.5 text-center hover:bg-[#2a4f7a] transition"
          >
            See Volunteer Sheets →
          </Link>
          <Link
            to="/volunteer"
            className="flex-1 border border-[#1E3A5F] text-[#1E3A5F] text-sm font-semibold rounded-lg py-2.5 text-center hover:bg-[#1E3A5F]/10 transition"
          >
            General Sign-Up
          </Link>
        </div>
      </div>

      {/* Emergency contacts + FEMA info */}
      <div className="mt-6 w-full max-w-md flex gap-2">
        <Link
          to="/emergency-contacts"
          className="flex-1 bg-[#DC2626] text-white text-sm font-semibold rounded-lg py-2.5 text-center hover:bg-red-700 transition"
        >
          📞 Emergency Contacts
        </Link>
        <Link
          to="/info"
          className="flex-1 bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg py-2.5 text-center hover:bg-[#2a4f7a] transition"
        >
          ℹ️ Emergency Info
        </Link>
      </div>

      {/* How to Help CTA */}
      <div className="mt-3 w-full max-w-md">
        <Link
          to="/how-to-help"
          className="flex items-center justify-between w-full bg-green-700 text-white font-bold text-sm rounded-lg px-4 py-3 hover:bg-green-800 transition"
        >
          <span>💚 How to Help</span>
          <span className="text-white/80">→</span>
        </Link>
      </div>

      {/* Volunteer stats — aggregate only, no PII */}
      <div className="mt-4">
        <VolunteerStats />
      </div>

      {/* Disclaimer + Footer */}
      <div className="mt-12 w-full max-w-md">
        <Disclaimer variant="condensed" />
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100 w-full max-w-md text-center text-xs text-gray-400 space-y-1">
        <p>Built by Guåhan.TECH for the Mariana Islands community.</p>
        <p>
          Want to help improve this app?{" "}
          <a
            href="https://github.com/agentic-mobile-intelligence/emergency-sinlaku"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E3A5F] underline"
          >
            View on GitHub
          </a>
          {" "}or{" "}
          <Link to="/contribute" className="text-[#1E3A5F] underline">
            find collaboration instructions here
          </Link>
          .
        </p>
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
          <Route path="/provider/register/failed" element={<ProviderRegisterFailedPage />} />
          <Route path="/provider/dashboard" element={<ProviderDashboardPage />} />
          <Route path="/provider/org/:orgId/members" element={<OrgMembersPage />} />
          <Route path="/support/anonymous" element={<AnonymousSupportPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/volunteer/sheets" element={<VolunteerSheetsPage />} />
          <Route path="/volunteer-leader" element={<VolunteerLeaderPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/how-to-help" element={<HowToHelpPage />} />
          <Route path="/transparency" element={<TransparencyPage />} />
          <Route path="/provider/archived" element={<ArchivedOrgsPage />} />
          <Route path="/instructions" element={<InstructionsPage />} />
          <Route path="/gov-officials" element={<GovOfficialsPage />} />
          <Route path="/fund-leader/apply" element={<FundLeaderApplyPage />} />
          <Route path="/feedback/:orgId" element={<FeedbackSubmitPage />} />
          <Route path="/feedback/submitted/:feedbackId" element={<FeedbackSubmittedPage />} />
          <Route path="/feedback/view/:feedbackId" element={<FeedbackViewPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster {...toasterProps} />
    </>
  )
}

export default App
