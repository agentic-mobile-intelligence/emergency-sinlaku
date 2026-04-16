import { Info } from "lucide-react"

interface DisclaimerProps {
  variant?: "full" | "condensed"
}

export default function Disclaimer({ variant = "full" }: DisclaimerProps) {
  if (variant === "condensed") {
    return (
      <p className="text-xs text-gray-400 max-w-md">
        Guahan.TECH is not affiliated with any government agency or political entity.
        This is an independent community organization strictly for helping the people of Guam, Saipan, Tinian, and Rota.
        Please reach out directly to official service organizations for their services.
      </p>
    )
  }

  return (
    <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <Info className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <strong>This organization is not affiliated with any government agency, political entity, or existing relief organization.</strong>{" "}
          Guahan.TECH is strictly an independent community organization created for the sole purpose
          of helping the people of <strong>Guam, Saipan, Tinian, and Rota</strong>.
        </p>
        <p>
          For direct contact with official service organizations, please reach out to them directly.
          This platform provides coordination and transparency — not replacement of existing relief infrastructure.
        </p>
      </div>
    </div>
  )
}
