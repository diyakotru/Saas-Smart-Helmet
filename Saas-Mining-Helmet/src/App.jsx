import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import Pages
import Homepage from "./pages/homepage.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Database from "./pages/database.jsx";
import Workers from "./pages/workers.jsx";      
import Settings from "./pages/settings.jsx";    

export default function App() {
  return (
    <Router>
      <Routes>

        {/* HOME PAGE */}
        <Route path="/" element={<Homepage />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

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
