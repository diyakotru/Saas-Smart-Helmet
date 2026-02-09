// Dashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

import LiveSensorDataPanel from "../components/live-sensor-panel";
import AlertsPanel from "../components/alerts-panel";

const THINGSPEAK_CHANNEL_ID = "3175273"; // keep your channel id here

export default function Dashboard() {
  const [refreshInterval] = useState(5000);

  // Shared alert list (source of truth for AlertsPanel)
  const [alertList, setAlertList] = useState([]);

  const mostRecentAlert = alertList.length > 0 ? alertList[0] : null;
  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    return `${minutes}m ago`;
  };

  // iframe styles (keeps chart responsive)
  const IFRAME_STYLE_FULL = {
    width: "100%",
    height: "100%",
    border: "none",
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-50 bg-black/80 shadow-md shadow-yellow-900/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <button className="px-3 py-1 rounded-md bg-gray-900 hover:bg-gray-700 text-yellow-400 text-sm border border-gray-700 transition duration-300 ease-in-out transform hover:scale-105">
                ← Back
              </button>
            </Link>

            <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 animate-fade-in">
              Real-Time Monitoring Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow shadow-green-500/50" />
            <span className="font-semibold tracking-wide">LIVE</span>
          </div>
        </div>
      </header>

      {mostRecentAlert && (
        <div className="max-w-7xl mx-auto px-4 mt-6 animate-slide-in-down">
          <div className="bg-red-950/30 border border-red-500 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-red-900/40 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping absolute opacity-75"></div>
                <div className="w-4 h-4 bg-red-600 rounded-full relative shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              </div>
              <div>
                <h3 className="text-red-400 font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                  CRITICAL ALERT: {mostRecentAlert.type}
                </h3>
                <p className="text-gray-200 text-base font-medium mt-1">
                    {mostRecentAlert.message}
                </p>
              </div>
            </div>
            <span className="text-red-300/70 text-sm font-mono border border-red-900/50 px-2 py-1 rounded bg-red-900/20">
              {formatTime(mostRecentAlert.timestamp)}
            </span>
          </div>
        </div>
      )}
      {/* Dashboard Body */}
      <section className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in-up">
        {/* A. Live Sensor Data */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-yellow-800/50 animate-slide-in-left">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-yellow-400">
            <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full animate-pulse-vertical" />
            Live Sensor Data
          </h2>
          {/* Pass setAlertList so the live panel can add/remove real alerts */}
          <LiveSensorDataPanel setAlertList={setAlertList} />
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {/* Temperature */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-yellow-800/50 animate-slide-in-up flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-yellow-400">
                <span></span>
                Temperature (live)
              </h2>
              <div className="w-full bg-[#0f1720] rounded-md overflow-hidden h-64 md:h-72 lg:h-80">
                <iframe
                  title="ThingSpeak Temperature"
                  src={`https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/charts/1?bgcolor=000000&color=00FFAA&dynamic=true&type=line&results=60`}
                  style={IFRAME_STYLE_FULL}
                />
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-yellow-800/50 animate-slide-in-up flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-yellow-400">
                <span></span>
                Humidity (live)
              </h2>
              <div className="w-full bg-[#0f1720] rounded-md overflow-hidden h-64 md:h-72 lg:h-80">
                <iframe
                  title="ThingSpeak Humidity"
                  src={`https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/charts/2?bgcolor=000000&color=60A5FA&dynamic=true&type=line&results=60`}
                  style={IFRAME_STYLE_FULL}
                />
              </div>
            </div>

            {/* Gas */}
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-yellow-800/50 animate-slide-in-up flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-yellow-400">
                <span></span>
                Gas Levels (live)
              </h2>
              <div className="w-full bg-[#0f1720] rounded-md overflow-hidden h-64 md:h-72 lg:h-80">
                <iframe
                  title="ThingSpeak Gas"
                  src={`https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/charts/3?bgcolor=000000&color=FBBF24&dynamic=true&type=line&results=60`}
                  style={IFRAME_STYLE_FULL}
                />
              </div>
            </div>
          </div>

        {/* C. Worker Activity + Alerts */}
        <div className="grid gap-8">
          {/* Alerts Panel (worker timeline removed to reduce clutter) */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-red-700/50 animate-slide-in-right">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-red-400">
              <span className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full animate-pulse-vertical" />
              Alerts
            </h2>
            <AlertsPanel alertList={alertList} />
          </div>
        </div>
      </section>
    </main>
  );
}
