import AnalyticsLayout from "../components/analytics-layout";
import { CHART_FRAME_STYLE, getThingSpeakChartUrl } from "../lib/analytics";

export default function AnalyticsOverall() {
  return (
    <AnalyticsLayout
      title="Overall Analytics"
      subtitle="Unified view of temperature, humidity, and gas trends."
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Temperature</p>
          <p className="text-lg font-semibold text-yellow-300 mt-1">Normal</p>
          <p className="text-sm text-gray-400 mt-2">Stable band, no heat stress risk.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Humidity</p>
          <p className="text-lg font-semibold text-blue-300 mt-1">Stable</p>
          <p className="text-sm text-gray-400 mt-2">Ventilation levels are effective.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Gas</p>
          <p className="text-lg font-semibold text-amber-300 mt-1">Safe</p>
          <p className="text-sm text-gray-400 mt-2">No hazardous spikes in the window.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">Temperature</h3>
          <div className="w-full h-72 bg-black/60 rounded-xl overflow-hidden">
            <iframe
              title="Overall Temperature"
              src={getThingSpeakChartUrl({ field: 1, color: "FBBF24" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Humidity</h3>
          <div className="w-full h-72 bg-black/60 rounded-xl overflow-hidden">
            <iframe
              title="Overall Humidity"
              src={getThingSpeakChartUrl({ field: 2, color: "60A5FA" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-amber-300 mb-4">Gas</h3>
          <div className="w-full h-72 bg-black/60 rounded-xl overflow-hidden">
            <iframe
              title="Overall Gas"
              src={getThingSpeakChartUrl({ field: 3, color: "F59E0B" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Operational Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <p>Temperature and humidity remain within comfortable thresholds for workers.</p>
          <p>Gas levels show no rapid spikes; maintain current ventilation profile.</p>
          <p>Download this page for daily compliance and safety briefs.</p>
        </div>
      </section>
    </AnalyticsLayout>
  );
}
