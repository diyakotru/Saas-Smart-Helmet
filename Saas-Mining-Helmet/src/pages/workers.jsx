// workers.jsx
"use client";

import React from "react";
import { Link } from "react-router-dom";
import WorkersOverviewPanel from "../components/workers-overview-panel";

export default function Workers() {
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
              Workers Overview
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-slow shadow-green-500/50" />
            <span className="font-semibold tracking-wide">LIVE</span>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        <div className="bg-gray-900 p-6 rounded-xl shadow-lg border border-yellow-800/50 animate-slide-in-bottom">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-yellow-400">
            <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full animate-pulse-vertical" />
            Active Workers
          </h2>

          <WorkersOverviewPanel />
        </div>
      </section>
    </main>
  );
}
