import { useEffect, useMemo, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import {
  THINGSPEAK_CHANNEL_ID,
  THINGSPEAK_READ_API_KEY,
} from "../lib/analytics";
import {
  ANALYTICS_THRESHOLDS,
  buildAiInsights,
  buildAiRecommendations,
  buildComplianceRows,
  buildIncidents,
  buildRiskInsights,
  calculateAiRiskLevel,
  computeAlertsPerShift,
  computeAverageValue,
  computeTrendDelta,
  computeUnsafeExposureMinutes,
  detectTrendSignals,
  formatClockTime,
  formatDateTime,
  formatSignedMetricDelta,
  normalizeFeeds,
} from "../lib/analytics-metrics";
import { downloadCompliancePDF, downloadPDF } from "../lib/analytics-report";
import { FiCloud, FiDroplet, FiThermometer } from "react-icons/fi";

const cardBase = "bg-[#0d1117] border border-gray-800 rounded-2xl transition hover:border-gray-700";
const sectionCard = `${cardBase} p-6`;

const getMetricStatus = (value, threshold, passLabel, failLabel) => {
  if (!Number.isFinite(value)) return { label: "--", tone: "text-gray-300" };
  if (value > threshold) return { label: failLabel, tone: "text-red-300" };
  return { label: passLabel, tone: "text-emerald-300" };
};

const getDeltaTone = (delta) => {
  if (!Number.isFinite(delta) || delta === 0) return "text-gray-400 border-gray-700 bg-white/5";
  return delta > 0 ? "text-amber-300 border-amber-500/30 bg-amber-500/10" : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";
};

export default function AnalyticsOverall() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCompliance, setShowAllCompliance] = useState(false);

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
  const trendSignals = useMemo(() => detectTrendSignals(rows, ANALYTICS_THRESHOLDS), [rows]);
  const aiRiskLevel = useMemo(
    () =>
      calculateAiRiskLevel({
        rows,
        incidents,
        unsafeMinutes,
        alertsPerShift,
        trendSignals,
        thresholds: ANALYTICS_THRESHOLDS,
      }),
    [rows, incidents, unsafeMinutes, alertsPerShift, trendSignals]
  );
  const aiInsights = useMemo(
    () =>
      buildAiInsights({
        rows,
        incidents,
        unsafeMinutes,
        alertsPerShift,
        trendSignals,
      }),
    [rows, incidents, unsafeMinutes, alertsPerShift, trendSignals]
  );
  const aiRecommendations = useMemo(
    () =>
      buildAiRecommendations({
        rows,
        thresholds: ANALYTICS_THRESHOLDS,
        trendSignals,
        riskLevel: aiRiskLevel,
      }),
    [rows, trendSignals, aiRiskLevel]
  );
  const riskInsights = useMemo(
    () => buildRiskInsights(incidents, rows, trendSignals),
    [incidents, rows, trendSignals]
  );
  const complianceRows = useMemo(
    () => buildComplianceRows(rows, ANALYTICS_THRESHOLDS, 18),
    [rows]
  );
  const latestTempAverage = useMemo(() => computeAverageValue(rows, "temperature"), [rows]);
  const latestHumidityAverage = useMemo(() => computeAverageValue(rows, "humidity"), [rows]);
  const latestGasAverage = useMemo(() => computeAverageValue(rows, "gas"), [rows]);
  const tempDelta = useMemo(() => computeTrendDelta(rows, "temperature"), [rows]);
  const humidityDelta = useMemo(() => computeTrendDelta(rows, "humidity"), [rows]);
  const gasDelta = useMemo(() => computeTrendDelta(rows, "gas"), [rows]);
  const latestIncident = incidents[0] || null;
  const latestReading = rows[rows.length - 1] || null;
  const displayComplianceRows = showAllCompliance ? complianceRows : complianceRows.slice(0, 5);
  const latestTemperatureStatus = getMetricStatus(
    latestReading?.temperature,
    ANALYTICS_THRESHOLDS.tempHigh,
    "Normal",
    "High"
  );
  const latestHumidityStatus = getMetricStatus(
    latestReading?.humidity,
    ANALYTICS_THRESHOLDS.humidityHigh,
    "Stable",
    "Unstable"
  );
  const latestGasStatus = getMetricStatus(
    latestReading?.gas,
    ANALYTICS_THRESHOLDS.gasWarning,
    "Safe",
    "Elevated"
  );
  const temperatureTrendSignal = trendSignals.find((signal) => signal.id === "temperature-rising");
  const humidityTrendSignal = trendSignals.find((signal) => signal.id === "humidity-dropping");
  const gasTrendSignal = trendSignals.find((signal) => signal.id === "gas-rising");

  const handleExportPdf = () => {
    downloadCompliancePDF({
      complianceRows,
    });
  };

  const handleDownloadPageReport = () => {
    downloadPDF({
      riskLevel: aiRiskLevel,
      incidents,
      unsafeMinutes,
      alertsPerShift,
      latestIncident,
      latestReading,
      temperatureStatus: latestTemperatureStatus.label,
      humidityStatus: latestHumidityStatus.label,
      gasStatus: latestGasStatus.label,
    });
  };

  const riskBadgeClasses = {
    SAFE: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    WARNING: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    DANGER: "text-red-300 border-red-500/30 bg-red-500/10",
  };

  const averageTiles = [
    {
      id: "temperature",
      label: "Avg Temp",
      icon: FiThermometer,
      value: latestTempAverage != null ? `${latestTempAverage.toFixed(1)}°C` : "--",
      delta: formatSignedMetricDelta(tempDelta, "°C"),
      tone: "text-yellow-300",
      badgeTone: getDeltaTone(tempDelta),
      signal: temperatureTrendSignal?.label || "Temperature steady over the last hour",
    },
    {
      id: "humidity",
      label: "Avg Humidity",
      icon: FiDroplet,
      value: latestHumidityAverage != null ? `${latestHumidityAverage.toFixed(1)}%` : "--",
      delta: formatSignedMetricDelta(humidityDelta, "%"),
      tone: "text-blue-300",
      badgeTone: getDeltaTone(humidityDelta),
      signal: humidityTrendSignal?.label || "Humidity steady over the last hour",
    },
    {
      id: "gas",
      label: "Avg Gas",
      icon: FiCloud,
      value: latestGasAverage != null ? `${Math.round(latestGasAverage)} ADC` : "--",
      delta: formatSignedMetricDelta(gasDelta, " ADC", 0),
      tone: "text-amber-300",
      badgeTone: getDeltaTone(gasDelta),
      signal: gasTrendSignal?.label || "Gas steady over the last hour",
    },
  ];

  return (
    <AnalyticsLayout
      title="Overall Analytics"
      subtitle="Unified view of temperature, humidity, and gas trends."
      onDownloadPage={handleDownloadPageReport}
    >
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 text-center">
        <div className={`${cardBase} p-5 ${riskBadgeClasses[aiRiskLevel.level] || "border-gray-800"}`}>
          <p className="text-xs uppercase tracking-wider text-gray-500">AI Risk Level</p>
          <p className="text-2xl font-semibold mt-2">{aiRiskLevel.level}</p>
          <p className="text-sm text-gray-400 mt-2">{aiRiskLevel.reason}</p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Unsafe Exposure Time Today</p>
          <p className="text-2xl font-semibold text-red-300 mt-2">
            {isLoading ? "--" : `${unsafeMinutes} minutes`}
          </p>
          <p className="text-sm text-gray-400 mt-2">Quantifies health risk and productivity loss.</p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Alerts per Shift</p>
          <p className="text-2xl font-semibold text-yellow-300 mt-2">
            {isLoading ? "--" : `${alertsPerShift.count} (${alertsPerShift.level})`}
          </p>
          <p className="text-sm text-gray-400 mt-2">Tracks instability impacting operations.</p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Latest Incident</p>
          <p className="text-lg font-semibold text-amber-300 mt-2">
            {latestIncident ? latestIncident.type : "No recent alerts"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {latestIncident ? formatDateTime(latestIncident.timestamp) : "System stable"}
          </p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Latest Reading</p>
          <p className="text-lg font-semibold text-cyan-300 mt-2">
            {latestReading ? `${latestReading.temperature ?? "--"}°C | ${latestReading.gas ?? "--"} ADC` : "No data"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {latestReading ? `Humidity ${latestReading.humidity ?? "--"}%` : "Waiting for live feed"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBase} p-5 border-l-4 border-l-yellow-400 text-left`}>
          <p className="text-xs uppercase text-gray-500">Temperature</p>
          <p className={`text-lg font-semibold mt-1 ${latestTemperatureStatus.tone}`}>
            {latestReading?.temperature != null ? `${latestReading.temperature}°C — ${latestTemperatureStatus.label}` : "No reading"}
          </p>
          <p className="text-sm text-gray-400 mt-2">{latestTemperatureStatus.label === "High" ? "Heat stress risk is elevated." : "Stable band, no heat stress risk."}</p>
        </div>
        <div className={`${cardBase} p-5 border-l-4 border-l-blue-400 text-left`}>
          <p className="text-xs uppercase text-gray-500">Humidity</p>
          <p className={`text-lg font-semibold mt-1 ${latestHumidityStatus.tone}`}>
            {latestReading?.humidity != null ? `${latestReading.humidity}% — ${latestHumidityStatus.label}` : "No reading"}
          </p>
          <p className="text-sm text-gray-400 mt-2">{latestHumidityStatus.label === "Unstable" ? "Ventilation or moisture balance needs adjustment." : "Ventilation levels are effective."}</p>
        </div>
        <div className={`${cardBase} p-5 border-l-4 border-l-amber-400 text-left`}>
          <p className="text-xs uppercase text-gray-500">Gas</p>
          <p className={`text-lg font-semibold mt-1 ${latestGasStatus.tone}`}>
            {latestReading?.gas != null ? `${latestReading.gas} ADC — ${latestGasStatus.label}` : "No reading"}
          </p>
          <p className="text-sm text-gray-400 mt-2">{latestGasStatus.label === "Elevated" ? "Improve extraction and recheck the workspace." : "No hazardous spikes in the window."}</p>
        </div>
      </section>

      <section className={`${cardBase} p-6 text-center`}>
        <p className="text-xs uppercase tracking-wider text-gray-500">Warnings</p>
        <p className="text-lg font-semibold text-emerald-300 mt-2">
          {latestIncident ? `${latestIncident.type} - ${latestIncident.severity}` : "No active warnings"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          {latestIncident ? latestIncident.message : "This area highlights any active threshold breaches."}
        </p>
      </section>

      <section className={`${cardBase} p-6`}>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white">Live Metrics Summary</h3>
            <p className="text-sm text-gray-400">24-hour averages with one-hour trend context.</p>
          </div>
          <span className="text-xs text-gray-500">Updated from recent rows</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {averageTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div key={tile.id} className="bg-[#11161c] border border-gray-800 rounded-xl p-5 transition hover:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500">{tile.label}</p>
                    <p className={`text-3xl font-semibold mt-2 ${tile.tone}`}>{tile.value}</p>
                  </div>
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/5 text-gray-300 border border-gray-800">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tile.badgeTone}`}>
                  {tile.delta} vs 1h ago
                </div>
                <p className="text-xs text-gray-400 mt-2">{tile.signal}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${sectionCard} min-h-[280px]`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Summary</h3>
            <span className="text-xs text-gray-500">Model-generated safety snapshot</span>
          </div>
          <div className="space-y-3">
            {isLoading && <p className="text-sm text-gray-500">Loading AI summary...</p>}
            {!isLoading && aiInsights.map((insight, index) => (
              <div key={`${insight}-${index}`} className="bg-black/40 border border-gray-800 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${sectionCard} min-h-[280px]`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
            <span className="text-xs text-gray-500">Actionable next steps</span>
          </div>
          <div className="space-y-3">
            {aiRecommendations.map((recommendation, index) => (
              <div key={`${recommendation}-${index}`} className="bg-black/40 border border-gray-800 rounded-lg px-4 py-3">
                <p className="text-sm text-gray-300">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Shift Risk Summary</p>
          <p className="text-sm text-gray-300 mt-2">{aiRiskLevel.level === "DANGER" ? "Immediate response required for the current operating window." : "Mid-shift heat load remains the main driver of safety variance."}</p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Trend Detection</p>
          <p className="text-sm text-gray-300 mt-2">{trendSignals.length > 0 ? trendSignals[0].label : "No continuously rising trend detected."}</p>
        </div>
        <div className={`${cardBase} p-5`}>
          <p className="text-xs uppercase text-gray-500">Compliance Note</p>
          <p className="text-sm text-gray-300 mt-2">Generate the PDF report for audit-ready reporting and daily safety briefs.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardBase} p-6`}>
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

        <div className={`${cardBase} p-6`}>
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

      <section className={`${cardBase} p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Automated Compliance & Safety Logs</h3>
            <p className="text-sm text-gray-400">Structured reporting for audits and regulatory needs.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-4 py-2 rounded-lg border border-yellow-500 text-yellow-300 hover:bg-yellow-500/10 transition"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => setShowAllCompliance((current) => !current)}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 hover:border-gray-600 transition"
            >
              {showAllCompliance ? "Show recent" : "Show all"}
            </button>
          </div>
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
              {displayComplianceRows.map((row) => (
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
        <p className="text-xs text-gray-500 mt-3">
          Showing {displayComplianceRows.length} of {complianceRows.length} recent rows.
        </p>
      </section>

      <section className={`${cardBase} p-6`}>
        <h3 className="text-lg font-semibold text-white mb-3">Operational Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <p>Temperature and humidity remain within comfortable thresholds for workers.</p>
          <p>{trendSignals.length > 0 ? trendSignals[0].message : "Gas levels show no rapid spikes; maintain current ventilation profile."}</p>
          <p>Use the PDF export for compliance submissions and daily safety briefs.</p>
        </div>
        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      </section>
    </AnalyticsLayout>
  );
}
