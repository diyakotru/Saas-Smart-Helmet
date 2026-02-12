import AnalyticsLayout from "../components/analytics-layout";
import { CHART_FRAME_STYLE, getThingSpeakChartUrl } from "../lib/analytics";

export default function AnalyticsGas() {
  return (
    <AnalyticsLayout
      title="Gas Analytics"
      subtitle="Clean view for hazardous gas patterns and alert windows."
    >
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Gas Trend</h3>
            <span className="text-xs text-gray-500">Last 120 readings</span>
          </div>
          <div className="w-full h-80 md:h-96 bg-black/60 rounded-xl overflow-hidden">
            <iframe
              title="Gas Analytics"
              src={getThingSpeakChartUrl({ field: 3, color: "F59E0B" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>

        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Safe Band</p>
            <p className="text-lg font-semibold text-emerald-300">0 - 25 PPM</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Alert Trigger</p>
            <p className="text-lg font-semibold text-red-300">Above 35 PPM</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Sensor Focus</p>
            <p className="text-sm text-gray-300">Early warning for toxic gas spikes.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Latest Status</p>
          <p className="text-xl font-semibold text-amber-300 mt-1">Safe</p>
          <p className="text-sm text-gray-400 mt-2">No elevated gas levels detected.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Operational Impact</p>
          <p className="text-sm text-gray-300 mt-2">Coordinate ventilation when trends approach the alert band.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Data Source</p>
          <p className="text-sm text-gray-300 mt-2">ThingSpeak channel feed with live sampling.</p>
        </div>
      </section>
    </AnalyticsLayout>
  );
}
