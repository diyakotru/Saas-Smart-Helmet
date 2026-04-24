// Dashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

import LiveSensorDataPanel from "../components/live-sensor-panel";
import AlertsPanel from "../components/alerts-panel";
import { Thermometer, Droplets, Flame, Activity, Wind } from "lucide-react";

const THINGSPEAK_CHANNEL_ID = "3175273";
const TABS = ["Readings", "Visualise", "Alerts"];
const IFRAME_STYLE = { width: "100%", height: "100%", border: "none" };

const chartConfigs = [
  { title: "Temperature",    field: 1, color: "22D3EE", icon: "🌡️" },
  { title: "Humidity",       field: 2, color: "60A5FA", icon: "💧" },
  { title: "Gas Levels",     field: 3, color: "FBBF24", icon: "🔬" },
  { title: "MPU6050 Motion", field: 8, color: "34D399", icon: "📡" },
  { title: "Flame Sensor",   field: 4, color: "F97316", icon: "🔥" },
];

const sensorMeta = [
  { key: "temp", label: "Temperature", unit: "°C", icon: <Thermometer size={26} />, cls: "temp" },
  { key: "hum", label: "Humidity", unit: "% RH", icon: <Droplets size={26} />, cls: "hum" },
  { key: "gas", label: "Gas Level", unit: "ADC", icon: <Wind size={26} />, cls: "gas" },
  { key: "mpu", label: "MPU6050 Motion", unit: "g", icon: <Activity size={26} />, cls: "mpu" },
  { key: "flame", label: "Flame Sensor", unit: "Digital", icon: <Flame size={26} />, cls: "flame" },
];

function chartSrc(field, color) {
  return `https://thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/charts/${field}?bgcolor=0B0F14&color=${color}&dynamic=true&type=line&results=30&linewidth=3&gridcolor=1E2530&xaxis=Date&yaxis=Value`;
}

function formatTime(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  return `${minutes}m ago`;
}

export default function Dashboard() {
  const [activeTab, setActiveTab]         = useState("Readings");
  const [alertList, setAlertList]         = useState([]);
  const [expandedChart, setExpandedChart] = useState(null);
  const [sensorValues, setSensorValues]   = useState({
    temp: "--", hum: "--", gas: "--", mpu: "--", flame: "--",
  });

  const mostRecentAlert = alertList.length > 0 ? alertList[0] : null;
  const unreadCount = alertList.length;

  return (
    <main style={{ minHeight:"100vh", background:"#080C12", color:"#E5E7EB", fontFamily:"'Poppins',sans-serif" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }

        .tab-bar { display:flex; gap:4px; background:#0D1117; border:1px solid #1E2530; border-radius:14px; padding:5px; }
        .tab-btn {
          position:relative; padding:8px 22px; border-radius:10px;
          font-size:14px; font-weight:600; font-family:'Poppins',sans-serif;
          cursor:pointer; border:none; transition:all 0.2s ease;
          letter-spacing:0.03em; background:transparent; color:#6B7280;
        }
        .tab-btn:hover { color:#D1D5DB; }
        .tab-btn.active { background:linear-gradient(135deg,#F59E0B 0%,#D97706 100%); color:#000; box-shadow:0 4px 20px rgba(245,158,11,0.35); }
        .badge {
          position:absolute; top:4px; right:4px; background:#EF4444; color:#fff;
          border-radius:999px; font-size:9px; font-weight:700; min-width:16px; height:16px;
          display:flex; align-items:center; justify-content:center; padding:0 4px;
          box-shadow:0 0 8px rgba(239,68,68,0.6);
        }

        .alert-banner {
          background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.35);
          border-radius:12px; padding:14px 20px;
          display:flex; align-items:center; gap:16px; margin-bottom:28px;
        }
        .ping-dot { position:relative; width:12px; height:12px; flex-shrink:0; }
        .ping-dot::before { content:''; position:absolute; inset:0; background:#EF4444; border-radius:50%; animation:ping 1.2s ease-out infinite; }
        .ping-dot::after  { content:''; position:absolute; inset:2px; background:#F87171; border-radius:50%; box-shadow:0 0 8px rgba(239,68,68,0.8); }
        @keyframes ping { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(2.2);opacity:0} }

        .section-title {
          font-size:13px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
          color:#6B7280; margin-bottom:20px; display:flex; align-items:center; gap:10px;
        }
        .section-title::before { content:''; width:3px; height:16px; background:linear-gradient(to bottom,#F59E0B,#D97706); border-radius:2px; flex-shrink:0; }

        /* 2-2-1 grid */
        .sensor-grid-221 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:32px; }

        .sensor-card-big {
          background:linear-gradient(145deg,#0D1117 0%,#0f1520 100%);
          border:1px solid #1E2530; border-radius:20px;
          padding:32px 36px; display:flex; flex-direction:column; gap:10px;
          transition:all 0.22s; position:relative; overflow:hidden;
        }
        .sensor-card-big::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0;
        }
        .sensor-card-big.temp::before  { background:linear-gradient(90deg,#22D3EE,#0EA5E9); }
        .sensor-card-big.hum::before   { background:linear-gradient(90deg,#60A5FA,#3B82F6); }
        .sensor-card-big.gas::before   { background:linear-gradient(90deg,#FBBF24,#F59E0B); }
        .sensor-card-big.mpu::before   { background:linear-gradient(90deg,#34D399,#10B981); }
        .sensor-card-big.flame::before { background:linear-gradient(90deg,#F97316,#EF4444); }

        .sensor-card-big:hover { border-color:#2D3748; transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.5); }

        .scb-top   { display:flex; align-items:center; justify-content:space-between; }
        .scb-icon  { font-size:28px; line-height:1; }
        .scb-label { font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#4B5563; }
        .scb-value { font-family:'Poppins',sans-serif; font-size: clamp(28px, 3vw, 36px); font-weight:800; line-height:1; margin:10px 0 4px; }
        .scb-unit  { font-size:12px; color:#374151; font-family:'Poppins',sans-serif; letter-spacing:0.05em; }

        .sensor-card-big.temp  .scb-value { color:#22D3EE; text-shadow:0 0 40px rgba(34,211,238,0.25); }
        .sensor-card-big.hum   .scb-value { color:#60A5FA; text-shadow:0 0 40px rgba(96,165,250,0.25); }
        .sensor-card-big.gas   .scb-value { color:#FBBF24; text-shadow:0 0 40px rgba(251,191,36,0.25); }
        .sensor-card-big.mpu   .scb-value { color:#34D399; text-shadow:0 0 40px rgba(52,211,153,0.25); }
        .sensor-card-big.flame .scb-value { color:#F97316; text-shadow:0 0 40px rgba(249,115,22,0.25); }

        /* last (5th) card centered */
        .sensor-card-big.lone { grid-column:1/-1; max-width:calc(50% - 10px); margin:0 auto; width:100%; }

        /* Charts */
        .chart-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
        .chart-card {
          background:#0D1117; border:1px solid #1E2530; border-radius:16px;
          padding:16px 16px 0 16px; display:flex; flex-direction:column; gap:12px;
          cursor:pointer; transition:all 0.2s; overflow:hidden; height:320px;
        }
        .chart-card:hover { border-color:#F59E0B55; transform:translateY(-2px); box-shadow:0 8px 32px rgba(245,158,11,0.12); }
        .chart-title { font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9CA3AF; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .chart-title-left { display:flex; align-items:center; gap:8px; }
        .expand-hint { font-size:11px; color:#374151; font-weight:500; letter-spacing:0; text-transform:none; transition:color 0.15s; }
        .chart-card:hover .expand-hint { color:#F59E0B; }
        .chart-wrap { flex:1; min-height:260px; margin:0 -16px; overflow:hidden; }
        .chart-wrap iframe { display:block; width:100%; height:100%; border:none; }

        /* Modal */
        .modal-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px);
          z-index:200; display:flex; align-items:center; justify-content:center;
          animation:fadeIn 0.2s ease both;
        }
        .modal-box {
          background:#0D1117; border:1px solid #F59E0B44; border-radius:20px; padding:28px;
          width:min(900px,92vw); box-shadow:0 32px 80px rgba(0,0,0,0.7);
          display:flex; flex-direction:column; gap:18px; animation:slideUp 0.25s ease both;
        }
        .modal-header { display:flex; align-items:center; justify-content:space-between; }
        .modal-title  { font-size:16px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#F9FAFB; display:flex; align-items:center; gap:10px; }
        .modal-close  {
          width:32px; height:32px; border-radius:8px; border:1px solid #1E2530;
          background:#111827; color:#6B7280; font-size:18px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; transition:all 0.15s; font-family:'Poppins',sans-serif;
        }
        .modal-close:hover { background:#1E2530; color:#F9FAFB; border-color:#374151; }
        .modal-chart-wrap { background:#080C12; border-radius:12px; overflow:hidden; height:500px; }

        .card { background:#0D1117; border:1px solid #1E2530; border-radius:16px; padding:24px; }

        .live-dot { width:8px; height:8px; background:#22C55E; border-radius:50%; animation:livepulse 1.8s ease-in-out infinite; box-shadow:0 0 8px #22C55E; }
        @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .fade-in  { animation:fadeIn  0.35s ease both; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:none} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      `}</style>

      {/* ── Header ── */}
      <header style={{ borderBottom:"1px solid #1E2530", background:"rgba(8,12,18,0.92)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:50, padding:"0 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>

          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <Link to="/">
              <button style={{ padding:"6px 14px", borderRadius:8, background:"#0D1117", border:"1px solid #1E2530", color:"#9CA3AF", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>← Back</button>
            </Link>
            <div>
              <h1 style={{ fontSize:18, fontWeight:800, color:"#F9FAFB", letterSpacing:"-0.02em", lineHeight:1 }}>Safety Monitor</h1>
              <p style={{ fontSize:11, color:"#4B5563", fontFamily:"Poppins,sans-serif", marginTop:2 }}>REAL-TIME DASHBOARD</p>
            </div>
          </div>

          <div className="tab-bar">
            {TABS.map(tab => (
              <button key={tab} className={`tab-btn${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
                {tab}
                {tab === "Alerts" && unreadCount > 0 && <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:700, color:"#22C55E", fontFamily:"Poppins,sans-serif" }}>
            <div className="live-dot" /> LIVE
          </div>
        </div>
      </header>

      {/* ── Hidden panel — runs fetch logic, feeds sensorValues + alertList ── */}
      <div style={{ position:"fixed", opacity:0, pointerEvents:"none", height:0, overflow:"hidden", zIndex:-1 }}>
        <LiveSensorDataPanel setAlertList={setAlertList} setSensorValues={setSensorValues} />
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px" }}>

        {/* ══ READINGS ══ */}
        {activeTab === "Readings" && (
          <div className="fade-in">
            {mostRecentAlert && (
              <div className="alert-banner">
                <div className="ping-dot" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", color:"#EF4444", textTransform:"uppercase", marginBottom:4 }}>
                    Critical Alert · {mostRecentAlert.type}
                  </div>
                  <div style={{ fontSize:14, color:"#F9FAFB", fontWeight:500 }}>{mostRecentAlert.message}</div>
                </div>
                <span style={{ fontFamily:"Poppins,sans-serif", fontSize:11, color:"#6B7280", whiteSpace:"nowrap" }}>
                  {formatTime(mostRecentAlert.timestamp)}
                </span>
              </div>
            )}

            <div className="section-title">Live Sensor Values</div>

            <div className="sensor-grid-221">
              {sensorMeta.map((s, i) => (
                <div key={s.key} className={`sensor-card-big ${s.cls}${i === 4 ? " lone" : ""}`}>
                  <div className="scb-top">
                    <span className="scb-label">{s.label}</span>
                    <span className="scb-icon">{s.icon}</span>
                  </div>
                  <div className="scb-value">
                    {sensorValues[s.key] !== "--"
                      ? Number(sensorValues[s.key]).toFixed(1)
                      : "--"}
                  </div>
                  <div className="scb-unit">{s.unit} · Live</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ VISUALISE ══ */}
        {activeTab === "Visualise" && (
          <div className="fade-in">
            <div className="section-title" style={{ marginBottom:20 }}>Sensor Graphs · Last 30 readings · Click to expand</div>
            <div className="chart-grid">
              {chartConfigs.map((cfg) => (
                <div className="chart-card" key={cfg.field} onClick={() => setExpandedChart(cfg)}>
                  <div className="chart-title">
                    <div className="chart-title-left">
                      <span>{cfg.icon}</span>
                      <span>{cfg.title}</span>
                    </div>
                    <span className="expand-hint">⛶ Expand</span>
                  </div>
                  <div className="chart-wrap">
                    <iframe title={cfg.title} src={chartSrc(cfg.field, cfg.color)} style={IFRAME_STYLE} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ ALERTS ══ */}
        {activeTab === "Alerts" && (
          <div className="fade-in">
            <div className="section-title" style={{ marginBottom:20 }}>Active Alerts</div>
            <div className="card">
              <AlertsPanel alertList={alertList} />
            </div>
          </div>
        )}
      </div>

      {/* ── Expanded Chart Modal ── */}
      {expandedChart && (
        <div className="modal-overlay" onClick={() => setExpandedChart(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span>{expandedChart.icon}</span>
                <span>{expandedChart.title}</span>
                <span style={{ fontSize:11, color:"#4B5563", fontWeight:400, textTransform:"none", letterSpacing:0, fontFamily:"Poppins,sans-serif" }}>· Live · Last 30 readings</span>
              </div>
              <button className="modal-close" onClick={() => setExpandedChart(null)}>✕</button>
            </div>
            <div className="modal-chart-wrap">
              <iframe
                key={expandedChart.field}
                title={`${expandedChart.title} expanded`}
                src={chartSrc(expandedChart.field, expandedChart.color)}
                style={IFRAME_STYLE}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}