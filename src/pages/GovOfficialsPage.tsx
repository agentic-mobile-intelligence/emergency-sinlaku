import { Link } from "react-router-dom"
import { LogIn, Building2, MessageCircle, Mail, ChevronRight, ShieldCheck } from "lucide-react"

export default function GovOfficialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-8">
          <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-1">For Government Officials</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Government of Guam & CNMI — How to Participate
          </h1>
          <p className="text-sm text-gray-700">
            Government of Guam and CNMI officials — reach out directly or self-register your agency.
            Residents are using this directory right now to find help. Let them know official resources are here.
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-8">
          Getting your agency listed takes less than 10 minutes. Here's how:
        </p>

        <div className="space-y-5">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="w-4 h-4 text-[#1E3A5F]" />
                <h2 className="text-sm font-bold text-[#1E3A5F]">Create an account or log in</h2>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Use your government or official email address to create an account. Email verification is required.
              </p>
              <Link
                to="/provider/register"
                className="inline-flex items-center bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-[#2a4f7a] transition"
              >
                <span>Create Account &amp; Register Organization</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#1E3A5F]" />
                <h2 className="text-sm font-bold text-[#1E3A5F]">Register your agency</h2>
              </div>
              <p className="text-sm text-gray-600">
                After signing up, complete the organization registration form with your agency's name, services offered,
                location, service hours, and contact information. Your agency will appear on the map for residents
                in your island seeking government resources.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1 border border-yellow-200 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-yellow-700" />
                <h2 className="text-sm font-bold text-yellow-800">Contact us directly</h2>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                For fastest visibility — or if you'd prefer assistance with registration — reach out directly.
                We can also coordinate how your agency's relief efforts are highlighted on the directory.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/16716887638"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-600 text-white text-xs font-semibold rounded-lg px-3 py-2.5 hover:bg-green-700 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: +1 671 688 7638</span>
                </a>
                <a
                  href="mailto:admin@guahan.tech"
                  className="flex items-center gap-2 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg px-3 py-2.5 hover:bg-gray-50 transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>admin@guahan.tech</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 my-8" />

        {/* Why participate */}
        <div>
          <h2 className="text-sm font-bold text-gray-800 mb-3">Why participate?</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A5F] font-bold mt-0.5">•</span>
              Residents and aid workers use this directory to find services — being listed means they can find you.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A5F] font-bold mt-0.5">•</span>
              Your agency's relief operations become visible alongside FEMA, Red Cross, and community organizations.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1E3A5F] font-bold mt-0.5">•</span>
              Direct coordination with the directory admin ensures your information is accurate and highlighted.
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-xs text-[#1E3A5F] underline hover:opacity-80">
            ← Back to Directory
          </Link>
        </div>
      </div>
    </div>
  )
}
