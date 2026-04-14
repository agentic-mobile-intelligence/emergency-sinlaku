import { Link } from "react-router-dom"

export default function EmergencyBanner() {
  return (
    <div
      style={{ backgroundColor: "#DC2626" }}
      className="w-full py-2 px-4 text-white text-sm font-semibold"
    >
      <div className="flex flex-row items-center justify-center gap-4 flex-wrap">
        <a href="tel:911" className="underline hover:opacity-80">
          911 Emergency
        </a>
        <a href="tel:311" className="underline hover:opacity-80">
          311 Non-Emergency
        </a>
        <a href="tel:1-800-621-3362" className="underline hover:opacity-80">
          FEMA 1-800-621-3362
        </a>
        <Link to="/news" className="underline hover:opacity-80">
          News
        </Link>
      </div>
    </div>
  );
}
