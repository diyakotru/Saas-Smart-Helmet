import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import Pages
import Homepage from "./pages/homepage.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Database from "./pages/database.jsx";
import Workers from "./pages/workers.jsx";      
import Settings from "./pages/settings.jsx";    
import AnalyticsOverall from "./pages/analytics-overall.jsx";
import AnalyticsTemperature from "./pages/analytics-temperature.jsx";
import AnalyticsHumidity from "./pages/analytics-humidity.jsx";
import AnalyticsGas from "./pages/analytics-gas.jsx";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* HOME PAGE */}
        <Route path="/" element={<Homepage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ANALYTICS */}
        <Route path="/analytics" element={<Navigate to="/analytics/overall" replace />} />
        <Route path="/analytics/overall" element={<AnalyticsOverall />} />
        <Route path="/analytics/temperature" element={<AnalyticsTemperature />} />
        <Route path="/analytics/humidity" element={<AnalyticsHumidity />} />
        <Route path="/analytics/gas" element={<AnalyticsGas />} />

        {/* DATABASE PAGE */}
        <Route path="/database" element={<Database />} />

        {/* WORKERS PAGE */}
        <Route path="/workers" element={<Workers />} />

        {/* SETTINGS PAGE */}
        <Route path="/settings" element={<Settings />} />

      </Routes>
    </Router>
  );
}
