"use client";

import { useState, useMemo } from "react";
import { Card } from "./ui/card"; // Assuming Card accepts Tailwind classes
import { Button } from "./ui/button"; // Assuming Button accepts Tailwind classes
import WorkerDetailsModal from "./worker-details-modal";

const INITIAL_WORKERS = [
  {
    id: "1",
    name: "Ram Pujari",
    workerId: "WRK001",
    helmetId: "HLM001",
    location: "Foundation Level",
    status: "Safe",
    age: 34,
    bloodGroup: "O+",
    knownDiseases: "None",
    emergencyContact: "+91-9876543210",
  },
  {
    id: "2",
    name: "Geeta kumari",
    workerId: "WRK002",
    helmetId: "HLM002",
    location: "Roof Section",
    status: "Safe",
    age: 28,
    bloodGroup: "A+",
    knownDiseases: "Asthma",
    emergencyContact: "+91-9123456780",
  },
  {
    id: "3",
    name: "Mona Singh",
    workerId: "WRK003",
    helmetId: "HLM003",
    location: "Electrical Room",
    status: "Warning",
    age: 41,
    bloodGroup: "B+",
    knownDiseases: "Diabetes",
    emergencyContact: "+91-9012345678",
  },
  {
    id: "4",
    name: "Nizaam Ali",
    workerId: "WRK004",
    helmetId: "HLM004",
    location: "Basement",
    status: "Safe",
    age: 37,
    bloodGroup: "AB-",
    knownDiseases: "None",
    emergencyContact: "+91-9988776655",
  },
  {
    id: "5",
    name: "Asvik",
    workerId: "WRK005",
    helmetId: "HLM005",
    location: "Main Hall",
    status: "Danger",
    age: 22,
    bloodGroup: "O-",
    knownDiseases: "None",
    emergencyContact: "+91-9900112233",
  },
  {
    id: "6",
    name: "Lata",
    workerId: "WRK006",
    helmetId: "HLM006",
    location: "Upper Level",
    status: "Safe",
    age: 30,
    bloodGroup: "A-",
    knownDiseases: "Hypertension",
    emergencyContact: "+91-9112233445",
  },
];

export default function WorkersOverviewPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState(INITIAL_WORKERS);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch =
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.workerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.helmetId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "All" || worker.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [workers, searchQuery, filterStatus]);

  // --- Theme-specific color mapping ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Safe":
        return "bg-teal-900/40 text-teal-400 border-teal-700/50"; // Green/Teal for Safe
      case "Warning":
        return "bg-yellow-900/40 text-yellow-400 border-yellow-700/50"; // Yellow for Warning
      case "Danger":
        return "bg-red-900/40 text-red-400 border-red-700/50"; // Red for Danger
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Safe":
        return "✓";
      case "Warning":
        return "⚠";
      case "Danger":
        return "❗"; // Using a stronger red exclamation mark
      default:
        return "";
    }
  };

  // Base class for filter buttons
  const baseFilterButtonClass =
    "px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.05]";
  const activeButtonClass =
    "bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-md shadow-yellow-500/30";
  const inactiveButtonClass =
    "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700";
  const detailsButtonClass =
    "bg-gray-700 text-yellow-400 hover:bg-gray-600 border border-gray-600 transform hover:scale-[1.02] transition duration-300";

  return (
    <div className="space-y-4">
            {/* Search + Filter Bar */}     {" "}
      <div className="flex flex-col md:flex-row gap-3 animate-fade-in-down">
               {" "}
        <input
          type="text"
          placeholder="Search by name, worker ID, or helmet ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-700 rounded-lg text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-300"
        />
               {" "}
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
                   {" "}
          {["All", "Safe", "Warning", "Danger"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`${baseFilterButtonClass} ${
                filterStatus === status
                  ? activeButtonClass
                  : inactiveButtonClass
              }`}
            >
                            {status}           {" "}
            </button>
          ))}
                 {" "}
        </div>
             {" "}
      </div>
            {/* Workers Grid */}     {" "}
      {filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                   {" "}
          {filteredWorkers.map((worker) => (
            <Card
              key={worker.id}
              className="p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-yellow-500 transition-all hover:shadow-xl hover:shadow-yellow-900/30 duration-300 transform hover:scale-[1.01] animate-scale-in"
            >
                           {" "}
              <div className="flex items-start justify-between mb-3">
                               {" "}
                <div className="flex-1">
                                   {" "}
                  <h3 className="font-bold text-lg text-yellow-400">
                    {worker.name}
                  </h3>
                                   {" "}
                  <p className="text-sm text-gray-500">ID: {worker.workerId}</p>
                                 {" "}
                </div>
                               {" "}
                <div
                  className={`px-3 py-1 rounded-full border font-semibold text-xs flex items-center gap-1 ${getStatusColor(worker.status)}`}
                >
                                    <span>{getStatusIcon(worker.status)}</span> 
                                  {worker.status.toUpperCase()}             
                   {" "}
                </div>
                             {" "}
              </div>
                           {" "}
              <div className="space-y-2 text-sm">
                               {" "}
                <div className="flex justify-between border-b border-gray-800 pb-1">
                                   {" "}
                  <span className="text-gray-500">Helmet ID:</span>             
                     {" "}
                  <span className="font-mono text-gray-300">
                    {worker.helmetId}
                  </span>
                                 {" "}
                </div>
                               {" "}
                <div className="flex justify-between">
                                   {" "}
                  <span className="text-gray-500">Location:</span>             
                      <span className="text-gray-300">{worker.location}</span> 
                               {" "}
                </div>
                             {" "}
              </div>
              <Button
                variant="outline"
                size="sm"
                className={`w-full mt-4 ${detailsButtonClass}`}
                onClick={() => setSelectedWorker(worker)}
              >
                View Details
              </Button>
                         {" "}
            </Card>
          ))}
                 {" "}
        </div>
      ) : (
        <Card className="p-8 bg-gray-900 border border-gray-700 text-center animate-pulse-subtle">
                   {" "}
          <p className="text-gray-500">
            No workers found matching your criteria
          </p>
                 {" "}
        </Card>
      )}
           {" "}
      <div className="text-sm text-gray-500 pt-2 animate-fade-in">
        Showing {filteredWorkers.length} of {workers.length} workers
      </div>
      {selectedWorker && (
        <WorkerDetailsModal
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onSave={(updated) => {
            setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
            setSelectedWorker(updated);
          }}
        />
      )}
         {" "}
    </div>
  );
}
