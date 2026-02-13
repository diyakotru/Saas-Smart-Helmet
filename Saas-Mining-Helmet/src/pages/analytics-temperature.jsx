import { useEffect, useState } from "react";
import AnalyticsLayout from "../components/analytics-layout";
import {
  CHART_FRAME_STYLE,
  getThingSpeakChartUrl,
  THINGSPEAK_CHANNEL_ID,
  THINGSPEAK_READ_API_KEY,
} from "../lib/analytics";

export default function AnalyticsTemperature() {
  return (
    <AnalyticsLayout
      title="Temperature Analytics"
      subtitle="Stable, cleaner visualization of temperature trends and thresholds."
    >
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0f141b] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-300">Temperature Trend</h3>
            <span className="text-xs text-gray-500">Last 30 readings</span>
          </div>
          <div className="w-full h-[60vh] md:h-[68vh] bg-black/60 rounded-xl overflow-hidden flex items-center justify-center">
            <iframe
              title="Temperature Analytics"
              src={getThingSpeakChartUrl({ field: 1, color: "FBBF24" })}
              style={CHART_FRAME_STYLE}
            />
          </div>
        </div>

        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Safety Band</p>
            <p className="text-lg font-semibold text-emerald-300">20°C - 30°C</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Alert Trigger</p>
            <p className="text-lg font-semibold text-red-300">Above 35°C</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500">Sensor Focus</p>
            <p className="text-sm text-gray-300">Heat stress prevention and equipment cooling.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#0f141b] border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-wider text-gray-500">Warnings</p>
        <p className="text-lg font-semibold text-emerald-300 mt-2">No active warnings</p>
        <p className="text-sm text-gray-400 mt-2">Alerts appear here when temperatures cross the safety band.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <PeakWindowCard />
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Recommended Action</p>
          <p className="text-sm text-gray-300 mt-2">Increase hydration reminders and rotate workers every 90 minutes.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Compliance Note</p>
          <p className="text-sm text-gray-300 mt-2">Document daily max temperature to meet safety audit requirements.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Latest Status</p>
          <p className="text-xl font-semibold text-yellow-300 mt-1">Normal</p>
          <p className="text-sm text-gray-400 mt-2">No anomalies detected in the current window.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Operational Impact</p>
          <p className="text-sm text-gray-300 mt-2">Use stable ranges to keep workers hydrated and equipment within safe limits.</p>
        </div>
        <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
          <p className="text-xs uppercase text-gray-500">Data Source</p>
          <p className="text-sm text-gray-300 mt-2">ThingSpeak channel feed with live sampling.</p>
        </div>
      </section>
    </AnalyticsLayout>
  );
}

function PeakWindowCard() {
  const [peakWindow, setPeakWindow] = useState("Calculating...");

  useEffect(() => {
    let mounted = true;

    async function loadFeeds() {
      try {
        const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_API_KEY}&results=60`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch feeds");
        const data = await res.json();
        const feeds = (data.feeds || [])
          .map((f) => ({ ts: new Date(f.created_at), value: Number(f.field1) }))
          .filter((f) => !Number.isNaN(f.value) && f.ts.toString() !== "Invalid Date")
          .sort((a, b) => a.ts - b.ts);

        if (!feeds.length) {
          if (mounted) setPeakWindow("No data");
          return;
        }

        const diffs = [];
        for (let i = 1; i < feeds.length; i++) diffs.push(feeds[i].ts - feeds[i - 1].ts);
        const avgInterval = diffs.length ? diffs.reduce((s, v) => s + v, 0) / diffs.length : 0;

        const THRESHOLD = 30; // consider temperatures above safe band as "high"

        const segments = [];
        let segStart = null;
        let segEnd = null;

        for (const f of feeds) {
          if (f.value > THRESHOLD) {
            if (!segStart) segStart = f.ts;
            segEnd = f.ts;
          } else if (segStart) {
            segments.push({ start: segStart, end: segEnd });
            segStart = null;
            segEnd = null;
          }
        }
        if (segStart) segments.push({ start: segStart, end: segEnd });

        if (!segments.length) {
          if (mounted) setPeakWindow("No prolonged high period");
          return;
        }

        // compute risk window: choose the continuous high-temperature segment with highest average value
        let bestRisk = null;
        for (const s of segments) {
          const segVals = feeds.filter((f) => f.ts >= s.start && f.ts <= s.end).map((f) => f.value);
          const mean = segVals.length ? segVals.reduce((a, b) => a + b, 0) / segVals.length : 0;
          if (!bestRisk || mean > bestRisk.mean) bestRisk = { ...s, mean };
        }

        const fmt = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        let label;
        if (bestRisk) {
          label = `${fmt(bestRisk.start)} - ${fmt(bestRisk.end)}`;
        } else {
          // fallback: use max reading window (one reading or small neighborhood)
          const maxVal = Math.max(...feeds.map((f) => f.value));
          const idx = feeds.findIndex((f) => f.value === maxVal);
          const sIdx = Math.max(0, idx - 1);
          const eIdx = Math.min(feeds.length - 1, idx + 1);
          label = `${fmt(feeds[sIdx].ts)} - ${fmt(feeds[eIdx].ts)}`;
        }

        if (mounted) setPeakWindow(label);
      } catch (err) {
        if (mounted) setPeakWindow("Error");
      }
    }

    loadFeeds();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-[#0f141b] border border-gray-800 rounded-2xl p-5">
      <p className="text-xs uppercase text-gray-500">Risk Window</p>
      <p className="text-lg font-semibold text-yellow-300 mt-1">{peakWindow}</p>
      <p className="text-sm text-gray-400 mt-2">Window derived from graph readings with the highest measured risk.</p>
    </div>
  );
}
