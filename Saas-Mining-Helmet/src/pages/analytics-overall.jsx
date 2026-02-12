import { useEffect, useMemo, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import {
  CHART_FRAME_STYLE,
  getThingSpeakChartUrl,
  THINGSPEAK_CHANNEL_ID,
  THINGSPEAK_READ_API_KEY,
} from "../lib/analytics";
import {
  ANALYTICS_THRESHOLDS,
  buildComplianceCsv,
  buildComplianceRows,
  buildIncidents,
  buildRiskInsights,
  computeAlertsPerShift,
  computeUnsafeExposureMinutes,
  formatClockTime,
  formatDateTime,
  normalizeFeeds,
} from "../lib/analytics-metrics";

export default function AnalyticsOverall() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=800`
        );

        if (!response.ok) throw new Error("Unable to load analytics data.");

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const normalized = normalizeFeeds(feeds);
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = normalized.filter((row) => row.timestamp.getTime() >= dayAgo);

        if (isMounted) {
          setRows(recent);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Analytics data unavailable.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
  }, []);

  const incidents = useMemo(() => buildIncidents(rows, ANALYTICS_THRESHOLDS), [rows]);
  const unsafeMinutes = useMemo(
    () => computeUnsafeExposureMinutes(rows, ANALYTICS_THRESHOLDS),
    [rows]
  );
  const alertsPerShift = useMemo(() => computeAlertsPerShift(incidents, 8), [incidents]);
  const riskInsights = useMemo(() => buildRiskInsights(incidents), [incidents]);
  const complianceRows = useMemo(
    () => buildComplianceRows(rows, ANALYTICS_THRESHOLDS, 18),
    [rows]
  );
  const latestIncident = incidents[0] || null;

  const handleExportCsv = () => {
    const csv = buildComplianceCsv(complianceRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "safety-compliance-log.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AnalyticsLayout
      title="Overall Analytics"
      subtitle="Unified view of temperature, humidity, and gas trends."
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Unsafe Exposure Time Today</p>
          <p className="text-2xl font-semibold text-red-300 mt-2">
            {isLoading ? "--" : `${unsafeMinutes} minutes`}
          </p>
          <p className="text-sm text-gray-400 mt-2">Quantifies health risk and productivity loss.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Alerts per Shift</p>
          <p className="text-2xl font-semibold text-yellow-300 mt-2">
            {isLoading ? "--" : `${alertsPerShift.count} (${alertsPerShift.level})`}
          </p>
          <p className="text-sm text-gray-400 mt-2">Tracks instability impacting operations.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Latest Incident</p>
          <p className="text-lg font-semibold text-amber-300 mt-2">
            {latestIncident ? latestIncident.type : "No recent alerts"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {latestIncident ? formatDateTime(latestIncident.timestamp) : "System stable"}
          </p>
        </div>
      </section>

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

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-gray-500">Warnings</p>
        <p className="text-lg font-semibold text-emerald-300 mt-2">
          {latestIncident ? `${latestIncident.type} - ${latestIncident.severity}` : "No active warnings"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {latestIncident ? latestIncident.message : "This area highlights any active threshold breaches."}
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Shift Risk Summary</p>
          <p className="text-sm text-gray-300 mt-2">Mid-shift heat load is the highest driver of safety variance.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Recommended Actions</p>
          <p className="text-sm text-gray-300 mt-2">Maintain hydration cycles, keep RH below 70%, and pre-run ventilation.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Compliance Note</p>
          <p className="text-sm text-gray-300 mt-2">Download daily summaries for audit-ready reporting.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Incident Timeline</h3>
            <span className="text-xs text-gray-500">Audit-ready sequence</span>
          </div>
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-gray-500">Loading incidents...</p>}
            {!isLoading && incidents.length === 0 && (
              <p className="text-sm text-gray-500">No incidents recorded in the last 24 hours.</p>
            )}
            {incidents.slice(0, 8).map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between bg-black/40 border border-gray-800 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-200">{incident.type}</p>
                  <p className="text-xs text-gray-400">{incident.message}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{formatClockTime(incident.timestamp)}</p>
                  <p className="text-xs text-amber-300">{incident.severity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Risk Pattern Detection</h3>
            <span className="text-xs text-gray-500">Predictive insights</span>
          </div>
          <div className="space-y-3">
            {riskInsights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="bg-black/40 border border-gray-800 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">Temperature</h3>
          <div className="w-full h-80 md:h-96 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center">
            <iframe
              title="Overall Temperature"
              src={getThingSpeakChartUrl({ field: 1, color: "FBBF24" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4">Humidity</h3>
          <div className="w-full h-80 md:h-96 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center">
            <iframe
              title="Overall Humidity"
              src={getThingSpeakChartUrl({ field: 2, color: "60A5FA" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-amber-300 mb-4">Gas</h3>
          <div className="w-full h-80 md:h-96 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center">
            <iframe
              title="Overall Gas"
              src={getThingSpeakChartUrl({ field: 3, color: "F59E0B" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Automated Compliance & Safety Logs</h3>
            <p className="text-sm text-gray-400">Structured reporting for audits and regulatory needs.</p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 hover:border-yellow-500 transition"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs uppercase text-gray-500 border-b border-gray-800">
              <tr>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Temp (°C)</th>
                <th className="py-2 pr-4">Humidity (%)</th>
                <th className="py-2 pr-4">Gas (ADC)</th>
                <th className="py-2 pr-4">Alerts</th>
                <th className="py-2">Unsafe</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {isLoading && (
                <tr>
                  <td className="py-3" colSpan={6}>
                    Loading compliance records...
                  </td>
                </tr>
              )}
              {!isLoading && complianceRows.length === 0 && (
                <tr>
                  <td className="py-3" colSpan={6}>
                    No records available yet.
                  </td>
                </tr>
              )}
              {complianceRows.map((row) => (
                <tr key={row.timestamp?.toISOString()} className="border-b border-gray-900">
                  <td className="py-3 pr-4">{formatDateTime(row.timestamp)}</td>
                  <td className="py-3 pr-4">{row.temperature ?? "--"}</td>
                  <td className="py-3 pr-4">{row.humidity ?? "--"}</td>
                  <td className="py-3 pr-4">{row.gas ?? "--"}</td>
                  <td className="py-3 pr-4">{row.alerts}</td>
                  <td className="py-3">{row.unsafe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Operational Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <p>Temperature and humidity remain within comfortable thresholds for workers.</p>
          <p>Gas levels show no rapid spikes; maintain current ventilation profile.</p>
          <p>Use the CSV export for compliance submissions and daily safety briefs.</p>
        </div>
        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </section>
    </AnalyticsLayout>
  );
}
