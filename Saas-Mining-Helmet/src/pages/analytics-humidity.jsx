import AnalyticsLayout from "../components/analytics-layout";
import { CHART_FRAME_STYLE, getThingSpeakChartUrl } from "../lib/analytics";

export default function AnalyticsHumidity() {
  return (
    <AnalyticsLayout
      title="Humidity Analytics"
      subtitle="Clean visualization to track humidity variance and moisture risk."
    >
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-300">Humidity Trend</h3>
            <span className="text-xs text-gray-500">Last 30 readings</span>
          </div>
          <div className="w-full h-[60vh] md:h-[68vh] bg-black/60 rounded-xl overflow-hidden flex items-center justify-center">
            <iframe
              title="Humidity Analytics"
              src={getThingSpeakChartUrl({ field: 2, color: "60A5FA" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>

        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Comfort Band</p>
            <p className="text-lg font-semibold text-emerald-300">40% - 70% RH</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Alert Trigger</p>
            <p className="text-lg font-semibold text-red-300">Above 80% RH</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Sensor Focus</p>
            <p className="text-sm text-gray-300">Moisture control and ventilation tuning.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-gray-500">Warnings</p>
        <p className="text-lg font-semibold text-emerald-300 mt-2">No active warnings</p>
        <p className="text-sm text-gray-400 mt-2">Alerts appear here if humidity crosses the comfort band.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Moisture Risk Window</p>
          <p className="text-lg font-semibold text-blue-300 mt-1">11:00 - 13:00</p>
          <p className="text-sm text-gray-400 mt-2">Watch for condensation near ventilation transitions.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Recommended Action</p>
          <p className="text-sm text-gray-300 mt-2">Adjust airflow and dehumidifier cycles to keep RH stable.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Compliance Note</p>
          <p className="text-sm text-gray-300 mt-2">Log RH variance for equipment corrosion tracking.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Latest Status</p>
          <p className="text-xl font-semibold text-blue-300 mt-1">Stable</p>
          <p className="text-sm text-gray-400 mt-2">Humidity is within acceptable operating limits.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Operational Impact</p>
          <p className="text-sm text-gray-300 mt-2">Balance moisture to reduce corrosion and improve air quality.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Data Source</p>
          <p className="text-sm text-gray-300 mt-2">ThingSpeak channel feed with live sampling.</p>
        </div>
      </section>
    </AnalyticsLayout>
  );
}
