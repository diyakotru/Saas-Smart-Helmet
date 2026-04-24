'use client';

import { useState } from 'react';
import { Link } from "react-router-dom";

// Assuming these components also adopt the new theme internally or are styled via props
import { Button } from "../components/ui/button";     
import WorkerListTable from "../components/worker-list-table";
import HelmetAssignmentTable from "../components/helmet-assignment-table";
import SensorDataHistoryTable from "../components/sensor-data-history-table";

export default function Database() {
  const [activeTab, setActiveTab] = useState('workers');

  // Helper class for primary yellow button styles (CTA/Dashboard link)
  const yellowButtonClass = "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-600 hover:to-amber-700 shadow-md shadow-yellow-500/30 transition duration-300 transform hover:scale-[1.02]";
  
  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-50 bg-black/80 shadow-md shadow-yellow-900/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center animate-fade-in">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="bg-gray-900 hover:bg-gray-700 text-yellow-400 border border-gray-700 transition duration-300 transform hover:scale-105">
                ← Back
              </Button>
            </Link>
            <h1 className="text-3xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 animate-fade-in-down">
              Data Archive Records
            </h1>
          </div>
          <Link to="/dashboard">
            <Button size="sm" className={yellowButtonClass}>
              View Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-0">
          {[
            { id: 'workers', label: 'Workers', icon: '👥' },
            { id: 'helmets', label: 'Helmet Assignments', icon: '🪖' },
        { id: 'history', label: 'Sensor Data History (Temp, Gas, Motion, Flame)', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold border-b-2 transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-800/30'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6 bg-gray-900 p-6 rounded-xl shadow-2xl shadow-gray-950/50 border border-gray-800 animate-slide-in-up-content">
        <div className="rounded-lg border border-gray-800 bg-gray-950/50 p-4 text-sm text-gray-400">
          Current helmet telemetry includes gas, temperature, humidity, MPU6050 motion, and flame detection.
        </div>
          {activeTab === 'workers' && <WorkerListTable />}
          {activeTab === 'helmets' && <HelmetAssignmentTable />}
          {activeTab === 'history' && <SensorDataHistoryTable />}
        </div>
      </section>
    </main>
  );
}