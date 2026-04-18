import { useEffect, useMemo, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import { ANALYTICS_THRESHOLDS } from "../lib/analytics-metrics";
import { THINGSPEAK_CHANNEL_ID, THINGSPEAK_READ_API_KEY } from "../lib/analytics";

const themeVars = {
  "--gas-page": "#0b1016",
  "--gas-surface": "#10161d",
  "--gas-surface-2": "#0d1117",
  "--gas-border": "#263041",
  "--gas-muted": "#94a3b8",
};

const cardBase =
  "rounded-2xl border border-[color:var(--gas-border)] bg-[var(--gas-surface)] transition hover:border-gray-700";
const sectionBase = `${cardBase} p-6`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatTime = (timestamp) => {
  if (!timestamp) return "--";
  return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatWindow = (start, end) => {
  if (!start || !end) return "--";
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const getGasStatus = (value) => {
  if (!Number.isFinite(value)) {
    return {
      state: "SAFE",
      tone: "text-emerald-300",
      accent: "border-emerald-400",
      message: "Waiting for live gas data.",
      icon: "✓",
    };
  }

  if (value > ANALYTICS_THRESHOLDS.gasDanger) {
    return {
      state: "DANGER",
      tone: "text-red-300",
      accent: "border-red-400",
      message: "Gas is above the danger threshold. Increase ventilation immediately.",
      icon: "!",
    };
  }

  if (value > ANALYTICS_THRESHOLDS.gasWarning) {
    return {
      state: "CAUTION",
      tone: "text-amber-300",
      accent: "border-amber-400",
      message: "Gas is approaching the alert threshold. Keep extraction active.",
      icon: "!",
    };
  }

  return {
    state: "SAFE",
    tone: "text-emerald-300",
    accent: "border-emerald-400",
    message: "Gas remains within the safe operating band.",
    icon: "✓",
  };
};

const getBarFillColor = (value) => {
  if (value > ANALYTICS_THRESHOLDS.gasDanger) return "#ef4444";
  if (value > ANALYTICS_THRESHOLDS.gasWarning) return "#f59e0b";
  return "#22c55e";
};

const buildSparklineData = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const maxValue = Math.max(...rows.map((row) => row.value ?? 0), 1);
  return rows.map((row) => ({
    ...row,
    height: clamp((row.value / maxValue) * 100, 12, 100),
  }));
};

const buildHighRiskWindow = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return "--";

  let bestSegment = null;
  let currentSegment = null;

  rows.forEach((row) => {
    if (row.value >= ANALYTICS_THRESHOLDS.gasWarning) {
      if (!currentSegment) {
        currentSegment = { start: row.timestamp, end: row.timestamp, values: [row.value] };
      } else {
        currentSegment.end = row.timestamp;
        currentSegment.values.push(row.value);
      }
      return;
    }

    if (currentSegment) {
      const average = currentSegment.values.reduce((sum, value) => sum + value, 0) / currentSegment.values.length;
      if (!bestSegment || average > bestSegment.average) {
        bestSegment = { ...currentSegment, average };
      }
      currentSegment = null;
    }
  });

  if (currentSegment) {
    const average = currentSegment.values.reduce((sum, value) => sum + value, 0) / currentSegment.values.length;
    if (!bestSegment || average > bestSegment.average) {
      bestSegment = { ...currentSegment, average };
    }
  }

  if (!bestSegment) return "No high-risk window";
  return formatWindow(bestSegment.start, bestSegment.end);
};

const countAsCaution = (value) => Number.isFinite(value) && value > ANALYTICS_THRESHOLDS.gasWarning && value <= ANALYTICS_THRESHOLDS.gasDanger;

export default function AnalyticsGas() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchGasReadings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=30`
        );

        if (!response.ok) throw new Error("Unable to load gas analytics data.");

        const data = await response.json();
        const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
        const readings = feeds
          .map((feed) => ({
            timestamp: feed.created_at ? new Date(feed.created_at) : null,
            value: Number.parseFloat(feed.field3),
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

    fetchGasReadings();
    return () => {
      isMounted = false;
    };
  }, []);

  const sparklineRows = useMemo(() => buildSparklineData(rows), [rows]);
  const latestReading = sparklineRows[sparklineRows.length - 1]?.value ?? null;
  const previousReading = sparklineRows[sparklineRows.length - 2]?.value ?? null;
  const status = getGasStatus(latestReading);
  const gaugeFill = Number.isFinite(latestReading)
    ? clamp((latestReading / ANALYTICS_THRESHOLDS.gasWarning) * 100, 0, 100)
    : 0;
  const gaugeColor = gaugeFill > 85 ? "#ef4444" : gaugeFill >= 60 ? "#f59e0b" : "#22c55e";
  const highRiskWindow = buildHighRiskWindow(sparklineRows);
  const trendLabel = countAsCaution(latestReading)
    ? "Caution"
    : latestReading > ANALYTICS_THRESHOLDS.gasDanger
      ? "Danger"
      : "Safe";
  const trendMessage = !Number.isFinite(latestReading)
    ? "Live gas feed is initializing."
    : latestReading > ANALYTICS_THRESHOLDS.gasDanger
      ? "Gas exceeds the danger threshold. Prioritize extraction and evacuation controls."
      : countAsCaution(latestReading)
        ? "Gas is rising toward the alert threshold. Monitor closely."
        : "Gas remains inside the safe band.";

  const statCards = [
    {
      label: "Current Gas",
      value: Number.isFinite(latestReading) ? `${Math.round(latestReading)} ADC — ${trendLabel}` : "--",
      accent: "border-l-emerald-400",
      valueTone: status.tone,
    },
    {
      label: "Safe Band",
      value: `0 - ${ANALYTICS_THRESHOLDS.gasWarning} ADC — Stable`,
      accent: "border-l-emerald-400",
      valueTone: "text-emerald-300",
    },
    {
      label: "Alert Trigger",
      value: `${ANALYTICS_THRESHOLDS.gasWarning} ADC — Watch`,
      accent: "border-l-red-400",
      valueTone: "text-red-300",
    },
    {
      label: "High-Risk Window",
      value: `${highRiskWindow} — Hot Zone`,
      accent: "border-l-amber-400",
      valueTone: "text-amber-300",
    },
  ];

  const actionCards = [
    {
      label: "High-Risk Window",
      title: highRiskWindow,
      body: "Ventilation load peaks here; treat this as the most sensitive monitoring period.",
      accent: "border-l-amber-400",
    },
    {
      label: "Recommended Action",
      title: "Run extraction fans at 85%",
      body: "Increase airflow when the gas curve approaches the alert band or starts climbing in sequence.",
      accent: "border-l-red-400",
      badge: latestReading > ANALYTICS_THRESHOLDS.gasWarning ? "Action required" : "Monitor",
    },
    {
      label: "Compliance Note",
      title: "Record spikes above the trigger",
      body: "Log any alert excursions for safety reporting and incident review.",
      accent: "border-l-emerald-400",
    },
    {
      label: "Latest Status",
      title: `${status.state} mode`,
      body: status.message,
      accent: status.state === "DANGER" ? "border-l-red-400" : status.state === "CAUTION" ? "border-l-amber-400" : "border-l-emerald-400",
    },
    {
      label: "Operational Impact",
      title: "Align ventilation with trend",
      body: "Keep extraction matched to rising gas load to reduce exposure and improve air quality.",
      accent: "border-l-blue-400",
    },
    {
      label: "Sensor Monitoring",
      title: isLoading ? "Fetching live feed" : `${sparklineRows.length} samples tracked`,
      body: Number.isFinite(latestReading)
        ? `Latest reading ${Math.round(latestReading)} ADC ${Number.isFinite(previousReading) ? `(${latestReading >= previousReading ? "up" : "down"} from previous)` : ""}`
        : "Waiting for live ThingSpeak samples.",
      accent: "border-l-slate-400",
    },
  ];

  return (
    <AnalyticsLayout
      title="Gas Analytics"
      subtitle="Live gas monitoring with sparkline trends, risk states, and response guidance."
    >
      <div className="space-y-6 text-gray-200" style={themeVars}>
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className={`${cardBase} p-5 border-l-4 ${card.accent}`}>
              <p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
              <p className={`text-lg font-semibold mt-2 ${card.valueTone}`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className={`${cardBase} p-6 overflow-hidden`}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Live Status</p>
              <h3 className={`text-3xl font-semibold mt-2 ${status.tone}`}>{status.state}</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">{trendMessage}</p>
            </div>
            <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${status.accent} bg-white/5`}>
              <span className={`text-3xl leading-none ${status.tone}`}>{status.icon}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-5 items-center">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Mini Sparkline</p>
                <p className="text-xs text-gray-500">Last 30 ThingSpeak field3 values</p>
              </div>
              <div className={`rounded-xl border border-[color:var(--gas-border)] bg-[var(--gas-surface-2)] p-3 ${isLoading ? "opacity-70" : ""}`}>
                <svg viewBox="0 0 300 40" className="h-10 w-full" role="img" aria-label="Gas readings sparkline chart">
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
                          fill={getBarFillColor(point.value)}
                          opacity={0.92}
                        />
                      );
                    })
                  ) : (
                    <text x="150" y="24" textAnchor="middle" fill="var(--gas-muted)" fontSize="10">
                      {isLoading ? "Loading live gas readings..." : "No readings available"}
                    </text>
                  )}
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`rounded-xl border border-[color:var(--gas-border)] bg-[var(--gas-surface-2)] p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Current ADC</p>
                  <p className={`text-sm font-semibold ${status.tone}`}>{status.state}</p>
                </div>
                <p className="text-3xl font-semibold mt-2 text-white">{Number.isFinite(latestReading) ? Math.round(latestReading) : "--"}</p>
                <p className="text-sm text-gray-400 mt-1">Current live reading from ThingSpeak field3.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Proximity to Alert</p>
                  <p className="text-xs text-gray-500">{Math.round(gaugeFill)}%</p>
                </div>
                <div className="h-3 rounded-full bg-white/6 border border-[color:var(--gas-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${gaugeFill}%`, backgroundColor: gaugeColor }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {Number.isFinite(latestReading)
                    ? `Reading is ${Math.round(gaugeFill)}% of the alert threshold (${ANALYTICS_THRESHOLDS.gasWarning} ADC).`
                    : "Gauge will fill once live data arrives."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${sectionBase}`}>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">Action + Compliance</h3>
              <p className="text-sm text-gray-400">Six operational cards arranged as a 2x3 panel.</p>
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
            <div className="flex items-center gap-3 md:pr-4 md:border-r md:border-[color:var(--gas-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sensor type</span>
              <span className="font-medium text-white">Gas ADC sensor</span>
            </div>
            <div className="flex items-center gap-3 md:px-4 md:border-r md:border-[color:var(--gas-border)]">
              <span className="text-xs uppercase tracking-wider text-gray-500">Sampling rate</span>
              <span className="font-medium text-white">~1 sample / 15 sec</span>
            </div>
            <div className="flex items-center gap-3 md:pl-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">Data source</span>
              <span className="font-medium text-white">ThingSpeak live feed</span>
            </div>
          </div>
        </section>
      </div>
    </AnalyticsLayout>
  );
}
