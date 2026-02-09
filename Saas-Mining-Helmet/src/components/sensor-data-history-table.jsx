'use client'

import { useState, useMemo } from 'react'

const MOCK_HISTORY = [
  {
    recordId: 'REC001',
    helmetId: 'HLM001',
    timestamp: '2024-11-19 14:32:15',
    temperature: 28.5,
    gasLevels: 12,
    fallDetected: false,
    batteryLevel: 85,
  },
  {
    recordId: 'REC002',
    helmetId: 'HLM002',
    timestamp: '2024-11-19 14:31:45',
    temperature: 29.2,
    gasLevels: 15,
    fallDetected: false,
    batteryLevel: 78,
  },
  {
    recordId: 'REC003',
    helmetId: 'HLM003',
    timestamp: '2024-11-19 14:31:20',
    temperature: 31.8,
    gasLevels: 45, // Warning level
    fallDetected: false,
    batteryLevel: 92,
  },
  {
    recordId: 'REC004',
    helmetId: 'HLM004',
    timestamp: '2024-11-19 14:30:50',
    temperature: 27.3,
    gasLevels: 8,
    fallDetected: false,
    batteryLevel: 88,
  },
  {
    recordId: 'REC005',
    helmetId: 'HLM005',
    timestamp: '2024-11-19 14:30:15',
    temperature: 32.1,
    gasLevels: 22,
    fallDetected: true, // Fall detected
    batteryLevel: 72,
  },
  {
    recordId: 'REC006',
    helmetId: 'HLM006',
    timestamp: '2024-11-19 14:29:40',
    temperature: 26.8,
    gasLevels: 11,
    fallDetected: false,
    batteryLevel: 81,
  },
  {
    recordId: 'REC007',
    helmetId: 'HLM001',
    timestamp: '2024-11-19 14:25:10',
    temperature: 28.2,
    gasLevels: 13,
    fallDetected: false,
    batteryLevel: 86,
  },
  {
    recordId: 'REC008',
    helmetId: 'HLM002',
    timestamp: '2024-11-19 14:20:05',
    temperature: 29.5,
    gasLevels: 16,
    fallDetected: false,
    batteryLevel: 79,
  },
]

export default function SensorDataHistoryTable() {
  const [sortField, setSortField] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')
  const [filterHelmet, setFilterHelmet] = useState('All')

  const helmets = useMemo(
    () => ['All', ...new Set(MOCK_HISTORY.map((h) => h.helmetId))],
    []
  )

  const filteredAndSorted = useMemo(() => {
    let filtered = MOCK_HISTORY

    if (filterHelmet !== 'All') {
      filtered = filtered.filter((record) => record.helmetId === filterHelmet)
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [sortField, sortDirection, filterHelmet])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // --- Theme Helpers ---
  const getTemperatureColor = (temp) => {
    if (temp > 32 || temp < 20) return 'text-red-500' // Danger
    return 'text-teal-400' // Safe/Normal
  }

  const getGasColor = (gas) => {
    if (gas > 40) return 'text-red-500' // Danger
    if (gas > 20) return 'text-yellow-500' // Warning
    return 'text-teal-400' // Safe
  }
  
  const baseFilterButtonClass = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.05]';
  const activeButtonClass = 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-md shadow-yellow-500/30';
  const inactiveButtonClass = 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700';
  const successBadgeClass = 'bg-teal-900/50 text-teal-400 border border-teal-700/50';
  const dangerBadgeClass = 'bg-red-900/50 text-red-400 border border-red-700/50 animate-pulse-slow';
  const batteryGoodClass = 'bg-teal-600';
  const batteryLowClass = 'bg-red-600';


  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Helmet Filters */}
      <div className="flex gap-2 flex-wrap animate-slide-in-down">
        {helmets.map((helmet) => (
          <button
            key={helmet}
            onClick={() => setFilterHelmet(helmet)}
            className={`${baseFilterButtonClass} ${
              filterHelmet === helmet
                ? activeButtonClass
                : inactiveButtonClass
            }`}
          >
            {helmet}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg shadow-xl shadow-gray-950/50 animate-fade-in-up">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800">
              {[
                'recordId',
                'helmetId',
                'timestamp',
                'temperature',
                'gasLevels',
                'fallDetected',
                'batteryLevel',
              ].map((field) => (
                <th key={field} className="px-0">
                  <button
                    onClick={() => handleSort(field)}
                    className={`px-4 py-3 text-left text-sm font-semibold transition-colors w-full flex items-center gap-1 ${
                      sortField === field ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {field.charAt(0).toUpperCase() +
                      field.slice(1).replace(/([A-Z])/g, ' $1')}
                    {sortField === field && (
                      <span className="ml-1 animate-pulse-vertical">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-gray-900">
            {filteredAndSorted.map((record, index) => (
              <tr
                key={record.recordId}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200"
                // Added staggered animation for rows
                style={{ animation: `slide-in-row 0.3s ease-out forwards ${index * 0.05}s`}}
              >
                <td className="px-4 py-3 text-sm font-mono text-gray-500">
                  {record.recordId}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-yellow-500 font-bold">{record.helmetId}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{record.timestamp}</td>

                <td className={`px-4 py-3 text-sm font-semibold ${getTemperatureColor(record.temperature)}`}>
                  {record.temperature}°C
                </td>

                <td className={`px-4 py-3 text-sm font-semibold ${getGasColor(record.gasLevels)}`}>
                  {record.gasLevels} PPM
                </td>

                <td className="px-4 py-3 text-sm">
                  {record.fallDetected ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${dangerBadgeClass}`}>
                      ALERT
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${successBadgeClass}`}>
                      OK
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${record.batteryLevel < 20 ? batteryLowClass : batteryGoodClass}`}
                        style={{ width: `${record.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-400">{record.batteryLevel}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 animate-fade-in-up">
        Showing {filteredAndSorted.length} of {MOCK_HISTORY.length} records
      </div>
    </div>
  )
}