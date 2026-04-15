import { Link } from "react-router-dom"
import { ExternalLink, MessageCircle, Code2, Database, Bug, GitPullRequest } from "lucide-react"

const GITHUB_URL = "https://github.com/agentic-mobile-intelligence/emergency-sinlaku"

export default function ContributePage() {
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1E3A5F]">Help Build This</h1>
          <p className="text-gray-600">
            This is an open project built for the Mariana Islands community. If you can help — with
            code, data, design, or outreach — you're welcome here.
          </p>
        </div>

        {/* GitHub */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Source Code</h2>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-5 py-4 hover:bg-gray-50 transition group"
          >
            <ExternalLink className="w-5 h-5 text-gray-700 shrink-0" />
            <div>
              <p className="font-medium text-[#1E3A5F] group-hover:underline">
                agentic-mobile-intelligence/emergency-sinlaku
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                View the code, open issues, and submit pull requests on GitHub
              </p>
            </div>
          </a>
        </section>

        {/* Ways to contribute */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Ways to Help</h2>
          <div className="space-y-2">
            <div className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3">
              <Code2 className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Write code</p>
                <p className="text-xs text-gray-500">
                  React + TypeScript frontend, Supabase backend. Fork the repo, pick an open issue,
                  and submit a PR.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3">
              <Database className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Add service data</p>
                <p className="text-xs text-gray-500">
                  Know of a relief service not listed?{" "}
                  <Link to="/provider/register" className="text-[#1E3A5F] underline">
                    Register as a provider
                  </Link>{" "}
                  or contact us to add it manually.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3">
              <Bug className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Report a bug</p>
                <p className="text-xs text-gray-500">
                  Found something broken?{" "}
                  <a href={`${GITHUB_URL}/issues/new`} target="_blank" rel="noopener noreferrer" className="text-[#1E3A5F] underline">
                    Open an issue on GitHub
                  </a>.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3">
              <GitPullRequest className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Submit a pull request</p>
                <p className="text-xs text-gray-500">
                  Fork the repo, create a branch, and open a PR against{" "}
                  <code className="bg-gray-100 px-1 rounded text-xs">main</code>. Include a short
                  description of what you changed and why.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Get in Touch</h2>
          <div className="flex gap-3 rounded-lg border border-gray-100 px-4 py-3">
            <MessageCircle className="w-4 h-4 text-[#1E3A5F] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">WhatsApp</p>
              <p className="text-xs text-gray-500">
                Reach the project team at{" "}
                <a
                  href="https://wa.me/16716887638"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1E3A5F] underline"
                >
                  +1 (671) 688-7638
                </a>{" "}
                or email{" "}
                <a href="mailto:admin@guahan.tech" className="text-[#1E3A5F] underline">
                  admin@guahan.tech
                </a>{" "}
                for data corrections, partnership questions, or anything else.
              </p>
            </div>
          </div>
        </section>

        {/* Donate */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Support the Platform</h2>
          <div className="rounded-xl border-2 border-[#DC2626]/20 bg-[#DC2626]/5 p-5 space-y-3">
            <p className="text-sm text-gray-700">
              This platform is built and maintained by <strong>Guåhan.TECH</strong>. Donations fund
              platform operations and direct on-call support for affected communities.
            </p>
            <Link
              to="/donate"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#DC2626] text-white text-sm font-semibold py-3 hover:bg-red-700 transition"
            >
              Pledge to Donate
            </Link>
          </div>
        </section>

        {/* Stack */}
        <section className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Tech Stack</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><span className="font-medium text-gray-800">Frontend:</span> React 18 + TypeScript + Vite</li>
            <li><span className="font-medium text-gray-800">UI:</span> Tailwind CSS + shadcn/ui</li>
            <li><span className="font-medium text-gray-800">Database:</span> Supabase (PostgreSQL)</li>
            <li><span className="font-medium text-gray-800">Maps:</span> OpenStreetMap via Leaflet</li>
            <li><span className="font-medium text-gray-800">Hosting:</span> Cloudflare Pages</li>
          </ul>
        </section>

        <p className="text-xs text-gray-400 text-center">
          Built by{" "}
          <a href="https://guahan.tech" target="_blank" rel="noopener noreferrer" className="underline">
            Guåhan.TECH
          </a>{" "}
          for the Mariana Islands community.{" "}
          <Link to="/" className="underline">Back to directory</Link>
        </p>
      </div>
    </div>
  )
}
