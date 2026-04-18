import { useEffect, useMemo, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import { ANALYTICS_THRESHOLDS } from "../lib/analytics-metrics";
import { THINGSPEAK_CHANNEL_ID, THINGSPEAK_READ_API_KEY } from "../lib/analytics";

const themeVars = {
  "--humidity-page": "#0b1016",
  "--humidity-surface": "#10161d",
  "--humidity-surface-2": "#0d1117",
  "--humidity-border": "#263041",
  "--humidity-muted": "#94a3b8",
};

const cardBase =
  "rounded-2xl border border-[color:var(--humidity-border)] bg-[var(--humidity-surface)] transition hover:border-gray-700";
const sectionBase = `${cardBase} p-6`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatTime = (timestamp) => {
  if (!timestamp) return "--";
  return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getHumidityStatus = (value) => {
  if (!Number.isFinite(value)) {
    return {
      state: "STABLE",
      tone: "text-blue-300",
      accent: "border-blue-400",
      message: "Waiting for live humidity data.",
      icon: "✓",
    };
  }

  if (value > 80 || value < ANALYTICS_THRESHOLDS.humidityLow) {
    return {
      state: "DANGER",
      tone: "text-red-300",
      accent: "border-red-400",
      message: value > 80 ? "Humidity is above the alert threshold. Check moisture control immediately." : "Humidity is below the comfort band and may cause dryness or drift.",
      icon: "!",
    };
  }

  if (value > ANALYTICS_THRESHOLDS.humidityHigh - 5) {
    return {
      state: "CAUTION",
      tone: "text-amber-300",
      accent: "border-amber-400",
      message: "Humidity is nearing the upper comfort limit. Monitor ventilation closely.",
      icon: "!",
    };
  }

  return {
    state: "STABLE",
    tone: "text-blue-300",
    accent: "border-blue-400",
    message: "Humidity remains in the comfort band.",
    icon: "✓",
  };
};

const getBarColor = (value) => {
  if (value > 80 || value < ANALYTICS_THRESHOLDS.humidityLow) return "#ef4444";
  if (value > ANALYTICS_THRESHOLDS.humidityHigh - 5) return "#f59e0b";
  return "#60a5fa";
};

const buildSparklineData = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const maxValue = Math.max(...rows.map((row) => row.value ?? 0), 1);
  return rows.map((row) => ({
    ...row,
    height: clamp((row.value / maxValue) * 100, 12, 100),
  }));
};

const buildMoistureWindow = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return "--";

  const riskRows = rows.filter((row) => row.value > ANALYTICS_THRESHOLDS.humidityHigh - 5 || row.value < ANALYTICS_THRESHOLDS.humidityLow);
  if (riskRows.length === 0) return "11:00 - 13:00";
  return `${formatTime(riskRows[0].timestamp)} - ${formatTime(riskRows[riskRows.length - 1].timestamp)}`;
};

const getProximityPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  return clamp((value / 80) * 100, 0, 100);
};

export default function AnalyticsHumidity() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHumidityReadings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=30`
        );

        if (!response.ok) throw new Error("Unable to load humidity analytics data.");

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const readings = feeds
          .map((feed) => ({
            timestamp: feed.created_at ? new Date(feed.created_at) : null,
            value: Number.parseFloat(feed.field2),
          }))
          .filter((row) => row.timestamp instanceof Date && !Number.isNaN(row.timestamp.getTime()) && Number.isFinite(row.value))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (isMounted) setRows(readings);
      } catch {
        if (isMounted) setRows([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHumidityReadings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sparklineRows = useMemo(() => buildSparklineData(rows), [rows]);
  const latestReading = sparklineRows[sparklineRows.length - 1]?.value ?? null;
  const previousReading = sparklineRows[sparklineRows.length - 2]?.value ?? null;
  const status = getHumidityStatus(latestReading);
  const proximity = getProximityPercent(latestReading);
  const gaugeColor = proximity > 85 ? "#ef4444" : proximity >= 60 ? "#f59e0b" : "#60a5fa";
  const moistureWindow = buildMoistureWindow(sparklineRows);

  const statCards = [
    {
      label: "Current Humidity",
      value: Number.isFinite(latestReading) ? `${Math.round(latestReading)}% RH — ${status.state}` : "--",
      accent: "border-l-blue-400",
    },
    {
      label: "Comfort Band",
      value: "30 - 70% RH — Stable",
      accent: "border-l-teal-400",
    },
    {
      label: "Alert Trigger",
      value: "Above 80% RH — Watch",
      accent: "border-l-red-400",
    },
    {
      label: "Moisture Risk Window",
      value: `${moistureWindow} — Sensitive`,
      accent: "border-l-amber-400",
    },
  ];

  const actionCards = [
    {
      label: "Recommended Action",
      title: "Adjust airflow and dehumidifier cycles",
      body: "Keep RH stable by balancing airflow before the moisture curve pushes into the alert band.",
      accent: "border-l-amber-400",
      badge: "Monitor",
    },
    {
      label: "Compliance Note",
      title: "Log RH variance for corrosion tracking",
      body: "Use humidity history to document material exposure and equipment reliability.",
      accent: "border-l-blue-400",
      badge: "Required",
    },
    {
      label: "Operational Impact",
      title: "Moisture balance affects air quality",
      body: "A stable humidity profile supports comfort, visibility, and reduced condensation.",
      accent: "border-l-purple-400",
    },
  ];

  return (
    <AnalyticsLayout
      title="Humidity Analytics"
      subtitle="Live humidity monitoring with sparkline trends, risk guidance, and moisture control cues."
    >
      <div className="space-y-6 text-gray-200" style={themeVars}>
        <section className={`${cardBase} p-6 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Humidity status</p>
              <h3 className={`text-3xl font-semibold mt-2 ${status.tone}`}>{status.state}</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">{status.message}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${status.accent} bg-white/5`}>
                <span className={`text-3xl leading-none ${status.tone}`}>{status.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Current RH</p>
                <p className={`text-4xl font-semibold mt-2 ${status.tone}`}>{Number.isFinite(latestReading) ? `${Math.round(latestReading)}%` : "--"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-5 items-center">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Humidity sparkline</p>
                <p className="text-xs text-gray-500">Last 30 ThingSpeak field2 readings</p>
              </div>
              <div className={`rounded-xl border border-[color:var(--humidity-border)] bg-[var(--humidity-surface-2)] p-3 ${isLoading ? "opacity-70" : ""}`}>
                <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label="Humidity readings sparkline chart">
                  {sparklineRows.length > 0 ? (
                    sparklineRows.map((point, index) => {
                      const barWidth = 300 / sparklineRows.length;
                      const barHeight = (point.height / 100) * 34;
                      const x = index * barWidth + 1;
                      const y = 38 - barHeight;
                      return (
                        <rect
                          key={`${point.timestamp?.toISOString() || index}`}
                          x={x}
                          y={y}
                          width={Math.max(2, barWidth - 2)}
                          height={Math.max(2, barHeight)}
                          rx="1.5"
                          fill={getBarColor(point.value)}
                          opacity={0.92}
                        />
                      );
                    })
                  ) : (
                    <text x="150" y="24" textAnchor="middle" fill="var(--humidity-muted)" fontSize="10">
                      {isLoading ? "Loading live humidity readings..." : "No readings available"}
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`${cardBase} p-4 bg-[var(--humidity-surface-2)]`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Current RH%</p>
                  <p className={`text-sm font-semibold ${status.tone}`}>{status.state}</p>
                </div>
                <p className="text-3xl font-semibold mt-2 text-white">{Number.isFinite(latestReading) ? `${Math.round(latestReading)}%` : "--"}</p>
                <p className="text-sm text-gray-400 mt-1">Current live reading from ThingSpeak field2.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Proximity to alert threshold</p>
                  <p className="text-xs text-gray-500">{Math.round(proximity)}%</p>
                </div>
                <div className="h-3 rounded-full bg-white/6 border border-[color:var(--humidity-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${proximity}%`, backgroundColor: gaugeColor }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Number.isFinite(latestReading)
                    ? `Reading is ${Math.round(proximity)}% of the 80% alert threshold.`
                    : "Gauge will fill once live data arrives."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardBase} p-6`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Top Stats</h3>
              <p className="text-sm text-gray-400">Live humidity, safety bands, and risk timing.</p>
            </div>
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
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Action Cards</h3>
              <p className="text-sm text-gray-400">Operational next steps and compliance reminders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionCards.map((card) => (
              <div key={card.label} className={`${cardBase} p-5 border-l-4 ${card.accent}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
                  {card.badge && (
                    <span className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-200 border border-gray-700">
                      {card.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-semibold text-white">{card.title}</h4>
                <p className="text-sm text-gray-400 mt-2">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${cardBase} p-4`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-gray-300">
            <div className="flex items-center gap-3 md:pr-4 md:border-r md:border-[color:var(--humidity-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sensor type</span>
              <span className="font-medium text-white">DHT22</span>
            </div>
            <div className="flex items-center gap-3 md:px-4 md:border-r md:border-[color:var(--humidity-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sampling rate</span>
              <span className="font-medium text-white">Every 15 sec</span>
            </div>
            <div className="flex items-center gap-3 md:px-4 md:border-r md:border-[color:var(--humidity-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Data source</span>
              <span className="font-medium text-white">ThingSpeak</span>
            </div>
            <div className="flex items-center gap-3 md:pl-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">Channel field</span>
              <span className="font-medium text-white">Field 2</span>
            </div>
          </div>
        </section>
      </div>
    </AnalyticsLayout>
  );
}
