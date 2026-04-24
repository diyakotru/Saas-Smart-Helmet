import { useEffect, useMemo, useState } from "react";
import { FiActivity } from "react-icons/fi";
import AnalyticsLayout from "../components/analytics-layout";
import { ANALYTICS_THRESHOLDS } from "../lib/analytics-metrics";
import { THINGSPEAK_CHANNEL_ID, THINGSPEAK_READ_API_KEY } from "../lib/analytics";

const themeVars = {
  "--motion-page": "#0b1016",
  "--motion-surface": "#10161d",
  "--motion-surface-2": "#0d1117",
  "--motion-border": "#263041",
  "--motion-muted": "#94a3b8",
};

const cardBase = "rounded-2xl border border-[color:var(--motion-border)] bg-[var(--motion-surface)] transition hover:border-gray-700";
const sectionBase = `${cardBase} p-6`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const buildSparklineData = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const maxValue = Math.max(...rows.map((row) => row.value ?? 0), 1);
  return rows.map((row) => ({ ...row, height: clamp((row.value / maxValue) * 100, 12, 100) }));
};

const getMotionStatus = (value) => {
  if (!Number.isFinite(value)) {
    return { state: "STABLE", tone: "text-emerald-300", accent: "border-emerald-400", message: "Waiting for live MPU6050 motion data.", icon: "✓" };
  }

  if (value > ANALYTICS_THRESHOLDS.motionDanger) {
    return { state: "SPIKE", tone: "text-red-300", accent: "border-red-400", message: "Motion is above the spike threshold and may indicate a fall or abrupt movement.", icon: "!" };
  }

  if (value > ANALYTICS_THRESHOLDS.motionWarning) {
    return { state: "ACTIVE", tone: "text-amber-300", accent: "border-amber-400", message: "Motion is elevated but still below the spike band.", icon: "!" };
  }

  return { state: "STABLE", tone: "text-emerald-300", accent: "border-emerald-400", message: "Motion remains in the stable band.", icon: "✓" };
};

export default function AnalyticsMotion() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchMotionReadings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=30`);
        if (!response.ok) throw new Error("Unable to load motion analytics data.");

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

    fetchMotionReadings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sparklineRows = useMemo(() => buildSparklineData(rows), [rows]);
  const latestReading = sparklineRows[sparklineRows.length - 1]?.value ?? null;
  const status = getMotionStatus(latestReading);

  const statCards = [
    { label: "Current Motion", value: Number.isFinite(latestReading) ? `${latestReading.toFixed(2)} — ${status.state}` : "--", accent: "border-l-emerald-400" },
    { label: "Stable Band", value: "0 - 2.0 — Calm", accent: "border-l-teal-400" },
    { label: "Alert Trigger", value: "Above 4.0 — Spike", accent: "border-l-red-400" },
    { label: "Sensor", value: "MPU6050 accelerometer + gyroscope", accent: "border-l-amber-400" },
  ];

  return (
    <AnalyticsLayout title="Motion Analytics" subtitle="Live MPU6050 motion tracking with spike detection and movement guidance.">
      <div className="space-y-6 text-gray-200" style={themeVars}>
        <section className={`${cardBase} p-6 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Motion status</p>
              <h3 className={`text-3xl font-semibold mt-2 ${status.tone}`}>{status.state}</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">{status.message}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${status.accent} bg-white/5`}>
                <span className={`text-3xl leading-none ${status.tone}`}>{status.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Current motion</p>
                <p className={`text-4xl font-semibold mt-2 ${status.tone}`}>{Number.isFinite(latestReading) ? latestReading.toFixed(2) : "--"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[color:var(--motion-border)] bg-[var(--motion-surface-2)] p-3">
            <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label="Motion readings sparkline chart">
              {sparklineRows.length > 0 ? (
                sparklineRows.map((point, index) => {
                  const barWidth = 300 / sparklineRows.length;
                  const barHeight = (point.height / 100) * 34;
                  const x = index * barWidth + 1;
                  const y = 38 - barHeight;
                  return <rect key={`${point.timestamp?.toISOString() || index}`} x={x} y={y} width={Math.max(2, barWidth - 2)} height={Math.max(2, barHeight)} rx="1.5" fill="#34d399" opacity="0.92" />;
                })
              ) : (
                <text x="150" y="24" textAnchor="middle" fill="var(--motion-muted)" fontSize="10">{isLoading ? "Loading live motion readings..." : "No readings available"}</text>
              )}
            </svg>
          </div>
        </section>

        <section className={`${cardBase} p-6`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Stats</h3>
              <p className="text-sm text-gray-400">Live motion, safe range, and MPU6050 tracking context.</p>
            </div>
            <FiActivity className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className={`${cardBase} p-5 border-l-4 ${card.accent}`}>
                <p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
                <p className="text-lg font-semibold text-white mt-2">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${sectionBase}`}>
          <h3 className="text-lg font-semibold text-white mb-2">Monitoring Notes</h3>
          <p className="text-sm text-gray-400">Motion spikes can indicate abrupt impact, a fall, or fast helmet movement. Use this signal together with the flame sensor for a fuller incident picture.</p>
        </section>
      </div>
    </AnalyticsLayout>
  );
}
