import { useEffect, useMemo, useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import AnalyticsLayout from "../components/analytics-layout";
import { ANALYTICS_THRESHOLDS } from "../lib/analytics-metrics";
import { THINGSPEAK_CHANNEL_ID, THINGSPEAK_READ_API_KEY } from "../lib/analytics";

const themeVars = {
  "--flame-page": "#0b1016",
  "--flame-surface": "#10161d",
  "--flame-surface-2": "#0d1117",
  "--flame-border": "#263041",
  "--flame-muted": "#94a3b8",
};

const cardBase = "rounded-2xl border border-[color:var(--flame-border)] bg-[var(--flame-surface)] transition hover:border-gray-700";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildSparklineData = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const maxValue = Math.max(...rows.map((row) => row.value ?? 0), 1);
  return rows.map((row) => ({ ...row, height: clamp((row.value / maxValue) * 100, 12, 100) }));
};

const getFlameStatus = (value) => {
  if (!Number.isFinite(value)) {
    return { state: "CLEAR", tone: "text-emerald-300", accent: "border-emerald-400", message: "Waiting for live flame sensor data.", icon: "✓" };
  }

  if (value >= ANALYTICS_THRESHOLDS.flameWarning) {
    return { state: "ALERT", tone: "text-red-300", accent: "border-red-400", message: "Flame sensor is detecting fire or flame presence.", icon: "!" };
  }

  return { state: "CLEAR", tone: "text-emerald-300", accent: "border-emerald-400", message: "Flame sensor is clear.", icon: "✓" };
};

export default function AnalyticsFlame() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchFlameReadings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=30`);
        if (!response.ok) throw new Error("Unable to load flame analytics data.");

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const readings = feeds
          .map((feed) => ({ timestamp: feed.created_at ? new Date(feed.created_at) : null, value: Number.parseFloat(feed.field4) }))
          .filter((row) => row.timestamp instanceof Date && !Number.isNaN(row.timestamp.getTime()) && Number.isFinite(row.value))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (isMounted) setRows(readings);
      } catch {
        if (isMounted) setRows([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFlameReadings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sparklineRows = useMemo(() => buildSparklineData(rows), [rows]);
  const latestReading = sparklineRows[sparklineRows.length - 1]?.value ?? null;
  const status = getFlameStatus(latestReading);

  return (
    <AnalyticsLayout title="Flame Analytics" subtitle="Live flame detection with alert state, history, and response guidance.">
      <div className="space-y-6 text-gray-200" style={themeVars}>
        <section className={`${cardBase} p-6 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Flame status</p>
              <h3 className={`text-3xl font-semibold mt-2 ${status.tone}`}>{status.state}</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">{status.message}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${status.accent} bg-white/5`}>
                <span className={`text-3xl leading-none ${status.tone}`}>{status.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Current flame</p>
                <p className={`text-4xl font-semibold mt-2 ${status.tone}`}>{Number.isFinite(latestReading) ? latestReading.toFixed(0) : "--"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--flame-border)] bg-[var(--flame-surface-2)] p-3">
            <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label="Flame readings sparkline chart">
              {sparklineRows.length > 0 ? (
                sparklineRows.map((point, index) => {
                  const barWidth = 300 / sparklineRows.length;
                  const barHeight = (point.height / 100) * 34;
                  const x = index * barWidth + 1;
                  const y = 38 - barHeight;
                  return <rect key={`${point.timestamp?.toISOString() || index}`} x={x} y={y} width={Math.max(2, barWidth - 2)} height={Math.max(2, barHeight)} rx="1.5" fill="#f97316" opacity="0.92" />;
                })
              ) : (
                <text x="150" y="24" textAnchor="middle" fill="var(--flame-muted)" fontSize="10">{isLoading ? "Loading live flame readings..." : "No readings available"}</text>
              )}
            </svg>
          </div>
        </section>

        <section className={`${cardBase} p-6`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Flame Detection Alerts</h3>
              <p className="text-sm text-gray-400">The flame sensor is treated as a fire presence alert and should trigger immediate review.</p>
            </div>
            <FiAlertTriangle className="h-5 w-5 text-orange-300" />
          </div>
          <div className={`${cardBase} p-5 border-l-4 ${status.accent}`}>
            <p className="text-xs uppercase tracking-wider text-gray-500">Alert policy</p>
            <p className="text-lg font-semibold text-white mt-2">Any non-zero flame reading is treated as a critical event.</p>
            <p className="text-sm text-gray-400 mt-2">Use the dashboard alert panel to dispatch safety response steps when this sensor fires.</p>
          </div>
        </section>
      </div>
    </AnalyticsLayout>
  );
}
