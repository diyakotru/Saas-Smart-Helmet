import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/analytics/temperature", label: "Temperature" },
  { to: "/analytics/humidity", label: "Humidity" },
  { to: "/analytics/gas", label: "Gas" },
  { to: "/analytics/overall", label: "Overall" },
];

export default function AnalyticsLayout({ title, subtitle, children }) {
  const location = useLocation();

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#0B0F14] text-gray-100 font-sans">
      <header className="border-b border-gray-800 bg-black/80 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="px-3 py-1 rounded-md bg-gray-900 hover:bg-gray-800 text-yellow-400 text-sm border border-gray-700 transition"
            >
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                Analytics Center
              </h1>
              <p className="text-xs text-gray-400 mt-1">Clean, focused insights per signal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition"
          >
            Download Page
          </button>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-[#0f141b] border border-gray-800 rounded-2xl p-4 h-fit">
          <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Analytics</h2>
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-4 py-2 rounded-lg border transition text-sm font-medium ${
                    isActive
                      ? "bg-yellow-500/15 border-yellow-500 text-yellow-300"
                      : "bg-black/30 border-gray-800 text-gray-300 hover:text-white hover:border-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400 mt-1">{subtitle}</p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
