import { useState } from "react";
import { Link } from "react-router-dom";
import HelmetImage from "../assets/HelmetImage.png";

export default function HomePage() {
  const [hoveredSensor, setHoveredSensor] = useState(null);

  const sensors = [
    { id: "helmet-light", name: "Mining Safety Light", icon: "🔴" },
    { id: "gas-detector", name: "Gas Detector (MQ-X)", icon: "💨" },
    { id: "temperature", name: "Temperature/Humidity", icon: "🌡️" },
    { id: "buzzer", name: "Buzzer/Audio Alert", icon: "🔔" },
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
    if (status === "Safe" || status === "Normal") {
      return "bg-emerald-600/20 text-emerald-400 border-emerald-600/30";
    } else if (status === "Standby") {
      return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    } else {
      return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-gray-100 font-sans">

      {/* Navigation */}
      <header className="border-b border-gray-800 backdrop-blur-xl bg-black/80 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center font-extrabold text-black text-lg">
              🛡️
            </div>
            <div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                SmartMine Guard
              </span>
              <div className="text-xs text-gray-400 -mt-1">Safety Intelligence Platform</div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-4">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 border border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-white rounded-lg transition-all duration-300"
            >
              Dashboard
            </Link>
            <Link
              to="/demo"
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all duration-300 shadow-lg shadow-yellow-500/20"
            >
              Request Demo
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 px-5 py-2.5 mb-8">
            <span className="text-yellow-300">⚡</span>
            <span className="text-sm font-semibold text-yellow-300 tracking-wider">
              ENTERPRISE SAFETY INTELLIGENCE
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Workplace Safety
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
              With Real-Time Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            SmartMine Guard is the cloud-powered safety platform that gives mining and industrial companies 
            real-time visibility, instant alerts, and data-driven insights to protect workers and ensure compliance.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/demo"
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 flex items-center gap-3 group text-lg"
            >
              Request Demo
            </Link>
            <Link
              to="/features"
              className="px-8 py-4 bg-gray-900/50 hover:bg-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group text-lg"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Product Visualization */}
        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          {/* Sensors List */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-amber-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-white">Sensor Technology</h3>
            </div>
            
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <button
                  key={sensor.id}
                  onMouseEnter={() => setHoveredSensor(sensor.id)}
                  onMouseLeave={() => setHoveredSensor(null)}
                  className={`w-full p-5 rounded-2xl text-left transition-all duration-300 border backdrop-blur-sm group ${
                    hoveredSensor === sensor.id
                      ? "bg-yellow-900/30 border-yellow-600 border-2 transform scale-[1.02] shadow-xl"
                      : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        hoveredSensor === sensor.id ? 'bg-yellow-500/20' : 'bg-gray-800/50'
                      }`}>
                        {sensor.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-yellow-300 transition-colors">
                          {sensor.name}
                        </h4>
                        <div className="text-xs text-gray-400 mt-1">
                          {hoveredSensor === sensor.id ? "Live data available →" : "Hover for details"}
                        </div>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      sensor.id === "helmet-light" ? "bg-red-500 animate-pulse" :
                      sensor.id === "gas-detector" ? "bg-emerald-500" :
                      sensor.id === "temperature" ? "bg-orange-500" :
                      "bg-purple-500"
                    }`}></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Helmet Visualization */}
          <div className="lg:col-span-1 flex justify-center items-center relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 rounded-3xl blur-2xl -z-10 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border-2 border-gray-800 shadow-2xl">
                <img
                  src={HelmetImage}
                  alt="Smart Helmet"
                  className="w-full max-w-sm object-contain transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-gray-900 border-2 border-emerald-500/50 rounded-full px-4 py-2 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-emerald-300">All Systems Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Details Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
              <h3 className="text-2xl font-bold text-white">Live Sensor Data</h3>
            </div>
            
            {currentDetails ? (
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-3xl p-6 border-2 border-gray-800 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-10 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="px-4 py-2 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700">
                    <span className="text-sm font-semibold text-gray-300">{currentDetails.tag}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-full border ${getStatusClasses(currentDetails.status)}`}>
                    <span className="text-sm font-bold">{currentDetails.status}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-2">Current Reading</div>
                  <div className="text-4xl font-bold text-white">{currentDetails.value}</div>
                </div>
                
                <p className="text-gray-400 leading-relaxed mb-6">{currentDetails.desc}</p>
                
                <div className="pt-6 border-t border-gray-800">
                  <div className="text-sm text-gray-400 mb-2">Sensor Details</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-mono">{hoveredSensor}</span>
                    <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                      ✅ Active
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-3xl p-8 border-2 border-dashed border-gray-800 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center mb-4">
                  📈
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">Select a Sensor</h4>
                <p className="text-gray-500">Hover over any sensor module to view live data</p>
              </div>
            )}
          </div>
        </div>

        {/* Problem Statement */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              The <span className="text-yellow-400">Safety Challenges</span> You Face
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Today's industrial environments demand more than traditional safety measures.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Limited Real-Time Visibility",
                description: "Supervisors can't see what's happening in tunnels or remote zones until it's too late.",
                icon: ""
              },
              {
                title: "Delayed Emergency Response",
                description: "Critical incidents often go unnoticed, losing precious response time.",
                icon: ""
              },
              {
                title: "Compliance Burden",
                description: "Manual logs and fragmented data make regulatory compliance time-consuming.",
                icon: ""
              }
            ].map((problem, index) => (
              <div key={index} className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 hover:border-yellow-500/30 transition-colors duration-300">
                <div className="text-3xl mb-6">{problem.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{problem.title}</h3>
                <p className="text-gray-400">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Solution Overview */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Cloud-Powered <span className="text-cyan-300">Safety Intelligence</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From reactive response to proactive protection with real-time monitoring.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                SmartMine Guard transforms safety management with our SaaS platform that connects IoT-enabled 
                helmets to a centralized cloud dashboard. Safety teams get real-time visibility, 
                instant alerts, and predictive insights all accessible from any device.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Cloud-based monitoring dashboard",
                  "Real-time mobile alerts",
                  "Predictive analytics engine",
                  "Enterprise-grade security",
                  "Scalable for any operation size",
                  "Automated compliance reporting"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-gray-800 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-auto">Live Dashboard Preview</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-emerald-400">142</div>
                  <div className="text-xs text-gray-400">Active Helmets</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-400">3</div>
                  <div className="text-xs text-gray-400">Active Alerts</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cyan-400">100%</div>
                  <div className="text-xs text-gray-400">Compliance</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white">Elevated CO detected in Zone B</span>
                  <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-white">Heat stress risk in Tunnel 4</span>
                  <span className="text-xs text-gray-400 ml-auto">15 min ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need in One <span className="text-yellow-400">Safety Platform</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for enterprise-scale operations with security, scalability, and simplicity at its core.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Hazard Detection",
                description: "Monitor gas levels, temperature, and motion anomalies with instant alerts to response teams.",
                icon: "🚨",
                color: "from-red-500/20 to-orange-600/20"
              },
              {
                title: "Live Worker Monitoring",
                description: "Track worker location, vitals, and safety status across multiple sites from one dashboard.",
                icon: "👷",
                color: "from-blue-500/20 to-cyan-600/20"
              },
              {
                title: "Centralized Command Dashboard",
                description: "Unified view of all operations with customizable widgets, alerts, and reporting.",
                icon: "📊",
                color: "from-yellow-500/20 to-amber-600/20"
              },
              {
                title: "Predictive Analytics",
                description: "AI-powered insights identify risk patterns before incidents occur.",
                icon: "🧠",
                color: "from-purple-500/20 to-violet-600/20"
              },
              {
                title: "Automated Compliance",
                description: "Generate audit-ready reports and maintain digital safety logs automatically.",
                icon: "📑",
                color: "from-emerald-500/20 to-green-600/20"
              },
              {
                title: "Multi-Site Scalability",
                description: "Manage hundreds or thousands of helmets across multiple locations from one platform.",
                icon: "🌐",
                color: "from-cyan-500/20 to-blue-600/20"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 hover:border-yellow-500/30 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>



        {/* Final CTA */}
        <div className="rounded-3xl border-2 border-yellow-500/30 bg-gradient-to-br from-gray-900/90 to-black/90 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Safety Operations?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join leading mining and industrial companies using SmartMine Guard to protect their workforce and improve safety compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/demo"
              className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-yellow-500/30"
            >
              Request a Demo
            </Link>
            <Link
              to="/contact"
              className="px-10 py-4 bg-transparent hover:bg-gray-800 border-2 border-gray-700 hover:border-yellow-500/50 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-black/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                  🛡️
                </div>
                <span className="font-bold text-white">SmartMine Guard</span>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise safety intelligence platform for mining and heavy industries.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "API", "Security", "Compliance"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Case Studies", "Blog", "Help Center"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Partners"]
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800/30">
            <p>© {new Date().getFullYear()} SmartMine Guard Safety Systems. All rights reserved.</p>
            <p className="mt-2">Protecting workers worldwide with intelligent safety solutions.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}