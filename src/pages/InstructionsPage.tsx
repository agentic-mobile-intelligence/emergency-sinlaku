import { Link } from "react-router-dom"
import { HandHeart, AlertCircle, Building2, ChevronRight } from "lucide-react"

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1E3A5F] mb-2">Instructions — How to Help or Get Help</h1>
        <p className="text-sm text-gray-600 mb-8">
          The Sinlaku Relief Directory connects people who need help with organizations and volunteers who can provide it.
          Choose the option that applies to you below.
        </p>

        <div className="space-y-4">
          {/* Volunteer */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-[#1E3A5F]/40 transition">
            <div className="flex items-start gap-4">
              <div className="bg-[#1E3A5F]/10 rounded-lg p-2.5 shrink-0">
                <HandHeart className="w-6 h-6 text-[#1E3A5F]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#1E3A5F] mb-1">Volunteer</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Sign up to help with relief operations. You can list your skills, availability, and island.
                  No account is required — your information is shared only with verified relief organizations.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/volunteer"
                    className="flex items-center justify-between bg-[#1E3A5F] text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-[#2a4f7a] transition"
                  >
                    <span>Sign Up to Volunteer</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                  <Link
                    to="/volunteer/sheets"
                    className="flex items-center justify-between border border-[#1E3A5F] text-[#1E3A5F] text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-[#1E3A5F]/5 transition"
                  >
                    <span>Browse Volunteer Sheets</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Request Aid */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-red-300 transition">
            <div className="flex items-start gap-4">
              <div className="bg-red-50 rounded-lg p-2.5 shrink-0">
                <AlertCircle className="w-6 h-6 text-[#DC2626]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#DC2626] mb-1">Request Aid</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Submit a request for emergency assistance — food, water, shelter, medical needs, and more.
                  If this is a life-threatening emergency, call <strong>911</strong> immediately.
                </p>
                <Link
                  to="/request-aid"
                  className="inline-flex items-center bg-[#DC2626] text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-red-700 transition"
                >
                  <span>Submit Aid Request</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Register as Support Organization */}
          <div className="border border-gray-200 rounded-xl p-5 hover:border-green-300 transition">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 rounded-lg p-2.5 shrink-0">
                <Building2 className="w-6 h-6 text-green-700" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-green-700 mb-1">Register as a Support Organization</h2>
                <p className="text-sm text-gray-600 mb-2">
                  Support organizations — including FEMA, the American Red Cross, local government agencies,
                  non-profits, and community groups — can register to be listed on the directory.
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Once registered, your organization's location, services, and contact information will be visible
                  to people searching for help on their island.
                </p>
                <Link
                  to="/provider/register"
                  className="inline-flex items-center bg-green-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-green-800 transition"
                >
                  <span>Register Your Organization</span>
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contact fallback */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
          <p className="font-semibold text-gray-700 mb-1">Need help navigating the site?</p>
          <p>
            Contact us at{" "}
            <a href="mailto:admin@guahan.tech" className="text-[#1E3A5F] underline">
              admin@guahan.tech
            </a>{" "}
            or WhatsApp{" "}
            <a href="https://wa.me/16716887638" target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] underline">
              +1 671 688 7638
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
