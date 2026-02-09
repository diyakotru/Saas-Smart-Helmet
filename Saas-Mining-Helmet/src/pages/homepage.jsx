import { useState } from "react";
import { Link } from "react-router-dom";
import HelmetImage from "../assets/HelmetImage.png";

export default function HomePage() {
  const [hoveredSensor, setHoveredSensor] = useState(null);

  const sensors = [
    {
  id: "helmet-light",
  name: "Mining Safety Light",
  icon: "🔴"
},
    { id: "gas-detector", name: "Gas Detector (MQ-X)", icon: "💨" },
    { id: "temperature", name: "Temperature/Humidity", icon: "🌡️" },
  //  { id: "led-indicator", name: "LED Indicator", icon: "💡" },
    { id: "buzzer", name: "Buzzer/Audio Alert", icon: "🔔" },
  ];

  const highlightStats = [
    { label: "Active Helmets", value: "1,240+" },
    { label: "Incidents Prevented", value: "98.2%" },
    { label: "Avg. Response Time", value: "4.6s" },
    { label: "Sites Monitored", value: "27" },
  ];

  const platformFeatures = [
    {
      title: "Real-time Hazard Detection",
      desc: "Live gas, temperature, and motion signals with alerts routed to supervisors in seconds.",
    },
    {
      title: "Predictive Safety Insights",
      desc: "Trend analysis flags rising risk zones before they become incidents.",
    },
    {
      title: "Location-aware Escalation",
      desc: "Auto-escalates critical alerts to the nearest response team with precise location cues.",
    },
    {
      title: "Compliance-ready Reporting",
      desc: "Audit-friendly logs, exports, and retention controls aligned with safety regulations.",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Deploy Helmets",
      desc: "Issue smart helmets and connect them to your site gateway in minutes.",
    },
    {
      step: "02",
      title: "Monitor Live Signals",
      desc: "Supervisors track risk levels and location status from a single dashboard.",
    },
    {
      step: "03",
      title: "Respond Instantly",
      desc: "Escalate alerts with automated workflows and confirm resolution on-site.",
    },
    {
      step: "04",
      title: "Review & Optimize",
      desc: "Use safety analytics to improve protocols and reduce incidents over time.",
    },
  ];

  const testimonials = [
    {
      quote:
        "We reduced response time by over 60% in our first month. The live alerts are a game-changer.",
      name: "Anita Verma",
      role: "Safety Operations Lead",
      company: "DeepRock Mining",
    },
    {
      quote:
        "The audit trail and incident exports saved us days of reporting every quarter.",
      name: "Marco Luis",
      role: "Compliance Manager",
      company: "North Ridge Minerals",
    },
  ];

  const getCurrentSensorDetails = (id) => {
    switch (id) {
      case "helmet-light":
        return {
          tag: "Safety Light",
          status: "Active",
          value: "Red LED On",
          desc: "High-visibility red helmet light ensuring worker safety in low-light mining zones.",
        };

      case "gas-detector":
        return {
          tag: "Environment",
          status: "Safe",
          value: "CO: 12 PPM",
          desc: "Monitors harmful gas levels (e.g., CO, Methane) in the environment to prevent worker exposure.",
        };
      case "temperature":
        return {
          tag: "Environment",
          status: "Normal",
          value: "28°C / 65% RH",
          desc: "Tracks environmental temperature and humidity to alert for heat stress or extreme cold conditions.",
        };
      //case "led-indicator":
      //  return {
      //    tag: "Visual Alert",
      //    status: "Green",
      //    value: "System OK",
      //    desc: "Visual status light on the helmet for quick, on-site status indication to supervisors.",
      //  };
      case "buzzer":
        return {
          tag: "Audio Alert",
          status: "Standby",
          value: "Silent",
          desc: "Audible alarm (85 dB+) for critical alerts like fall detection or high gas readings.",
        };
      default:
        return null;
    }
  };

  const currentDetails = getCurrentSensorDetails(hoveredSensor);

  const getStatusClasses = (status) => {
    if (status === "Safe" || status === "Normal" || status === "Green") {
      return "bg-teal-600/20 text-teal-400";
    } else if (status === "Standby") {
      return "bg-gray-600/20 text-gray-400";
    } else {
      return "bg-yellow-600/20 text-yellow-400";
    }
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans relative overflow-hidden">

      {/* Ambient background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

      {/* 🔥 UPDATED NAVBAR WITH NEW OPTIONS */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-black/80 sticky top-0 z-10 shadow-md shadow-yellow-900/10">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center animate-fade-in">
          
          {/* Left Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center font-extrabold text-black text-lg transform hover:scale-110 transition duration-300">
              SC
            </div>
            <span className="font-extrabold text-xl text-white tracking-wider">SMART-CAP</span>
          </div>

          {/* Right Navigation Buttons */}
          <div className="flex gap-4 flex-wrap">

            <Link
              to="/dashboard"
              className="px-4 py-2 border border-yellow-500 text-yellow-400 rounded-lg hover:bg-yellow-900/50 transition font-medium transform hover:scale-105 duration-300"
            >
              Dashboard
            </Link>

            <Link
              to="/workers"
              className="px-4 py-2 border border-yellow-500 text-yellow-400 rounded-lg hover:bg-yellow-900/50 transition font-medium transform hover:scale-105 duration-300"
            >
              Workers Overview
            </Link>

            <Link
              to="/settings"
              className="px-4 py-2 border border-yellow-600 text-yellow-400 rounded-lg hover:bg-yellow-900/50 transition font-medium transform hover:scale-105 duration-300"
            >
              Settings
            </Link>

            <Link
              to="/database"
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition font-medium shadow-lg shadow-yellow-500/30 transform hover:scale-105 duration-300"
            >
              Data Archive
            </Link>

          </div>

        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 animate-fade-in-up">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white animate-fade-in-down">
            IoT-Enabled {" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
              S<span className="text-white">mart</span> Miner Safety Helmet
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-fade-in-up-delay">
            Real-time sensor data visualization system for enhanced worker safety and environmental hazard detection.
          </p>
        </div>

        {/* Sensors + Helmet Image */}
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left: Sensor Legend */}
          <div className="space-y-4 animate-slide-in-left">
            <h3 className="font-bold text-xl text-yellow-400 border-b border-gray-800 pb-2 mb-4">
              Sensor Components
            </h3>
            {sensors.map((sensor) => (
              <button
                key={sensor.id}
                onMouseEnter={() => setHoveredSensor(sensor.id)}
                onMouseLeave={() => setHoveredSensor(null)}
                className={`w-full p-4 rounded-xl text-left border transition-all shadow-lg ${
                  hoveredSensor === sensor.id
                    ? "bg-yellow-900/30 border-yellow-600 text-white transform scale-[1.02] duration-150"
                    : "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                } transform hover:scale-[1.01] duration-200`}
              >
                <div className="font-semibold text-lg flex items-center gap-2">
                  <span className="text-2xl">{sensor.icon}</span>
                  {sensor.name}
                </div>
              </button>
            ))}
          </div>

          {/* Center: Helmet Image */}
          <div className="lg:col-span-1 flex justify-center w-full min-h-[500px] animate-fade-in-zoom">
            <img
              src={HelmetImage}
              alt="Smart Helmet"
              className="w-full max-w-sm object-contain rounded-xl shadow-xl shadow-yellow-500/10 transform hover:scale-105 transition duration-300"
            />
          </div>

          {/* Right: Sensor Details */}
          <div className="space-y-4 animate-slide-in-right">
            <h3 className="font-bold text-xl text-yellow-400 border-b border-gray-800 pb-2 mb-4">
              Live Sensor Details
            </h3>
            {currentDetails ? (
              <div className="p-6 rounded-xl bg-gray-900 border border-yellow-600 shadow-xl shadow-yellow-500/20 space-y-4 animate-scale-in">
                <div className="flex justify-between items-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-sm font-semibold uppercase tracking-wider">
                    {currentDetails.tag}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClasses(currentDetails.status)}`}
                  >
                    {currentDetails.status}
                  </div>
                </div>
                <h4 className="text-3xl font-extrabold text-yellow-400">{currentDetails.value}</h4>
                <p className="text-gray-400 leading-relaxed text-sm">{currentDetails.desc}</p>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <span className="text-yellow-400 text-sm font-semibold">Sensor ID:</span>{" "}
                  <span className="text-gray-400 text-sm">{hoveredSensor}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-gray-900 border border-gray-800 text-gray-500 text-center animate-pulse-subtle">
                <p>Hover over a sensor on the left to see its live details and location on the helmet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black px-6 py-6 shadow-lg shadow-yellow-500/10"
            >
              <div className="text-3xl font-extrabold text-yellow-400">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Platform Value */}
        <div className="mt-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Platform Advantage</p>
            <h2 className="text-4xl font-extrabold text-white">
              A unified safety command center built for high-risk sites
            </h2>
            <p className="text-gray-400 leading-relaxed">
              SMART-CAP brings sensor intelligence, response coordination, and compliance reporting into one
              experience. Supervisors see what is happening now, what is likely to happen next, and what actions
              were taken.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 rounded-full border border-yellow-500/40 text-yellow-300 text-sm">
                24/7 Monitoring
              </div>
              <div className="px-4 py-2 rounded-full border border-yellow-500/40 text-yellow-300 text-sm">
                Incident Workflows
              </div>
              <div className="px-4 py-2 rounded-full border border-yellow-500/40 text-yellow-300 text-sm">
                Export-ready Reports
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-8 shadow-xl shadow-yellow-500/10">
            <h3 className="text-xl font-semibold text-white">Operations Snapshot</h3>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Live Helmets Online</span>
                <span className="text-yellow-400 font-semibold">1,214</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600" style={{ width: "82%" }} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Risk Alerts Today</span>
                <span className="text-yellow-400 font-semibold">12</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600" style={{ width: "24%" }} />
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Resolved in &lt; 5 min</span>
                <span className="text-yellow-400 font-semibold">91%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600" style={{ width: "91%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Core Capabilities</p>
            <h2 className="text-4xl font-extrabold text-white mt-4">Everything needed to prevent incidents</h2>
            <p className="text-gray-400 mt-4">
              Designed for mining operations where every second matters and every decision is audited.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg shadow-yellow-500/10"
              >
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400 mt-3 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow */}
        <div className="mt-24 rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-black p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">How It Works</p>
              <h2 className="text-4xl font-extrabold text-white mt-4">A clear safety workflow for every shift</h2>
            </div>
            <p className="text-gray-400 max-w-xl">
              From deployment to post-incident review, SMART-CAP keeps teams aligned with operational protocols.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step) => (
              <div key={step.step} className="rounded-2xl border border-gray-800 bg-black/40 p-6">
                <div className="text-yellow-400 text-sm font-semibold">{step.step}</div>
                <h3 className="text-lg font-semibold text-white mt-3">{step.title}</h3>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">Field Feedback</p>
            <h2 className="text-4xl font-extrabold text-white">Trusted by safety teams</h2>
            <p className="text-gray-400">
              Teams across multi-site operations rely on SMART-CAP to standardize safety response.
            </p>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
                <p className="text-gray-300 leading-relaxed">"{item.quote}"</p>
                <div className="mt-6">
                  <div className="text-white font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-400">
                    {item.role} · {item.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-24 grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">FAQ</p>
            <h2 className="text-4xl font-extrabold text-white mt-4">Built for rapid deployment</h2>
            <p className="text-gray-400 mt-4">
              Roll out across new sites without redesigning infrastructure.
            </p>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h3 className="text-white font-semibold">Does it work offline in tunnels?</h3>
              <p className="text-gray-400 mt-2">
                Yes. Helmets store readings locally and sync once the gateway reconnects.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h3 className="text-white font-semibold">How long is battery life?</h3>
              <p className="text-gray-400 mt-2">
                A standard shift coverage of 14+ hours with fast swap packs.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h3 className="text-white font-semibold">Can we export safety logs?</h3>
              <p className="text-gray-400 mt-2">
                Yes. Export CSV, PDF, and API feeds for compliance reporting.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center space-y-4 animate-fade-in-up-delay-more">
          <p className="text-gray-400 text-lg">Ready to review the safety log?</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black rounded-lg hover:from-yellow-600 hover:to-amber-700 transition shadow-lg shadow-yellow-500/40 font-bold text-lg transform hover:scale-105 duration-300"
            >
              View Live Dashboard
            </Link>
            <Link
              to="/database"
              className="px-8 py-3 border border-yellow-500 text-yellow-400 rounded-lg hover:bg-yellow-900/50 transition font-bold text-lg transform hover:scale-105 duration-300"
            >
              Access Historical Data
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}