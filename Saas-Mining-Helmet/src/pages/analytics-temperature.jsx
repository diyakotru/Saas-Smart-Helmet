import { useEffect, useMemo, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import { ANALYTICS_THRESHOLDS } from "../lib/analytics-metrics";
import { THINGSPEAK_CHANNEL_ID, THINGSPEAK_READ_API_KEY } from "../lib/analytics";

const themeVars = {
  "--temperature-page": "#0b1016",
  "--temperature-surface": "#10161d",
  "--temperature-surface-2": "#0d1117",
  "--temperature-border": "#263041",
  "--temperature-muted": "#94a3b8",
};

const cardBase =
  "rounded-2xl border border-[color:var(--temperature-border)] bg-[var(--temperature-surface)] transition hover:border-gray-700";
const sectionBase = `${cardBase} p-6`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getTemperatureStatus = (value) => {
  if (!Number.isFinite(value)) {
    return {
      state: "NORMAL",
      tone: "text-amber-300",
      accent: "border-amber-400",
      message: "Waiting for live temperature data.",
      icon: "✓",
    };
  }

  if (value > ANALYTICS_THRESHOLDS.tempHigh) {
    return {
      state: "HEAT STRESS",
      tone: "text-red-300",
      accent: "border-red-400",
      message: "Temperature is above the safe limit and requires immediate cooling action.",
      icon: "!",
    };
  }

  if (value > 30) {
    return {
      state: "WARM",
      tone: "text-orange-300",
      accent: "border-orange-400",
      message: "Temperature is rising toward the alert band; monitor ventilation closely.",
      icon: "!",
    };
  }

  return {
    state: "NORMAL",
    tone: "text-amber-300",
    accent: "border-amber-400",
    message: "Temperature remains inside the comfort band.",
    icon: "✓",
  };
};

const getBarColor = (value) => {
  if (value > ANALYTICS_THRESHOLDS.tempHigh) return "#ef4444";
  if (value > 30) return "#fb923c";
  return "#facc15";
};

const buildSparklineData = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const maxValue = Math.max(...rows.map((row) => row.value ?? 0), 1);
  return rows.map((row) => ({
    ...row,
    height: clamp((row.value / maxValue) * 100, 12, 100),
  }));
};

const formatTime = (timestamp) => {
  if (!timestamp) return "--";
  return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const buildRiskWindow = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return "12:00 - 15:00";
  const highRows = rows.filter((row) => row.value > 30);
  if (highRows.length === 0) return "12:00 - 15:00";
  return `${formatTime(highRows[0].timestamp)} - ${formatTime(highRows[highRows.length - 1].timestamp)}`;
};

const getProximityPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  return clamp((value / ANALYTICS_THRESHOLDS.tempHigh) * 100, 0, 100);
};

const getGaugeColor = (proximity) => {
  if (proximity > 85) return "#ef4444";
  if (proximity >= 60) return "#fb923c";
  return "#facc15";
};

export default function AnalyticsTemperature() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTemperatureReadings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=30`
        );

        if (!response.ok) throw new Error("Unable to load temperature analytics data.");

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const readings = feeds
          .map((feed) => ({
            timestamp: feed.created_at ? new Date(feed.created_at) : null,
            value: Number.parseFloat(feed.field1),
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

    fetchTemperatureReadings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sparklineRows = useMemo(() => buildSparklineData(rows), [rows]);
  const latestReading = sparklineRows[sparklineRows.length - 1]?.value ?? null;
  const previousReading = sparklineRows[sparklineRows.length - 2]?.value ?? null;
  const status = getTemperatureStatus(latestReading);
  const riskWindow = buildRiskWindow(sparklineRows);
  const proximity = getProximityPercent(latestReading);
  const gaugeColor = getGaugeColor(proximity);

  const statCards = [
    {
      label: "Current Temperature",
      value: Number.isFinite(latestReading) ? `${Math.round(latestReading)}°C — ${status.state}` : "--",
      accent: "border-l-yellow-400",
    },
    {
      label: "Safe Band",
      value: "16 - 30°C — Stable",
      accent: "border-l-teal-400",
    },
    {
      label: "Alert Trigger",
      value: "Above 35°C — Watch",
      accent: "border-l-red-400",
    },
    {
      label: "High-Risk Window",
      value: `${riskWindow} — Peak afternoon heat`,
      accent: "border-l-amber-400",
    },
  ];

  const actionCards = [
    {
      label: "Recommended Action",
      title: "Increase ventilation when temperature approaches 33°C",
      body: "Use additional airflow before the curve reaches the alert band.",
      accent: "border-l-amber-400",
      badge: "Monitor",
    },
    {
      label: "Compliance Note",
      title: "Log any readings above 35°C for heat stress reporting",
      body: "Document alert excursions so safety records stay audit ready.",
      accent: "border-l-blue-400",
      badge: "Required",
    },
    {
      label: "Operational Impact",
      title: "Schedule rest breaks when sustained temperature exceeds 30°C",
      body: "Break timing helps reduce fatigue and heat exposure during active shifts.",
      accent: "border-l-purple-400",
    },
  ];

  return (
    <AnalyticsLayout
      title="Temperature Analytics"
      subtitle="Live temperature monitoring with sparkline trends, heat stress warnings, and action guidance."
    >
      <div className="space-y-6 text-gray-200" style={themeVars}>
        <section className={`${cardBase} p-6 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Temperature status</p>
              <h3 className={`text-3xl font-semibold mt-2 ${status.tone}`}>{status.state}</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">{status.message}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${status.accent} bg-white/5`}>
                <span className={`text-3xl leading-none ${status.tone}`}>{status.icon}</span>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Current °C</p>
                <p className={`text-4xl font-semibold mt-2 ${status.tone}`}>{Number.isFinite(latestReading) ? `${Math.round(latestReading)}°C` : "--"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-5 items-center">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Temperature sparkline</p>
                <p className="text-xs text-gray-500">Last 30 ThingSpeak field1 readings</p>
              </div>
              <div className={`rounded-xl border border-[color:var(--temperature-border)] bg-[var(--temperature-surface-2)] p-3 ${isLoading ? "opacity-70" : ""}`}>
                <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label="Temperature readings sparkline chart">
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
                    <text x="150" y="24" textAnchor="middle" fill="var(--temperature-muted)" fontSize="10">
                      {isLoading ? "Loading live temperature readings..." : "No readings available"}
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`${cardBase} p-4 bg-[var(--temperature-surface-2)]`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Current reading</p>
                  <p className={`text-sm font-semibold ${status.tone}`}>{status.state}</p>
                </div>
                <p className="text-3xl font-semibold mt-2 text-white">{Number.isFinite(latestReading) ? `${Math.round(latestReading)}°C` : "--"}</p>
                <p className="text-sm text-gray-400 mt-1">Current live reading from ThingSpeak field1.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Proximity to heat stress threshold</p>
                  <p className="text-xs text-gray-500">{Math.round(proximity)}%</p>
                </div>
                <div className="h-3 rounded-full bg-white/6 border border-[color:var(--temperature-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${proximity}%`, backgroundColor: gaugeColor }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Number.isFinite(latestReading)
                    ? `Reading is ${Math.round(proximity)}% of the 35°C alert threshold.`
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
              <p className="text-sm text-gray-400">Live temperature, safe range, and peak heat timing.</p>
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
              <p className="text-sm text-gray-400">Operational response and compliance reminders.</p>
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
            <div className="flex items-center gap-3 md:pr-4 md:border-r md:border-[color:var(--temperature-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sensor type</span>
              <span className="font-medium text-white">DHT22</span>
            </div>
            <div className="flex items-center gap-3 md:px-4 md:border-r md:border-[color:var(--temperature-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sampling rate</span>
              <span className="font-medium text-white">Every 15 sec</span>
            </div>
            <div className="flex items-center gap-3 md:px-4 md:border-r md:border-[color:var(--temperature-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Data source</span>
              <span className="font-medium text-white">ThingSpeak</span>
            </div>
            <div className="flex items-center gap-3 md:pl-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">Channel field</span>
              <span className="font-medium text-white">Field 1</span>
            </div>
          </div>
        </section>
      </div>
    </AnalyticsLayout>
  );
}
