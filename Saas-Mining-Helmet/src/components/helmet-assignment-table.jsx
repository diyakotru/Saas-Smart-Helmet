'use client'

import { useState, useMemo } from 'react'

const MOCK_HELMETS = [
  {
    helmetId: 'HLM001',
    assignedWorker: 'Ram Pujari',
    workerId: 'WRK001',
    assignmentDate: '2024-01-10',
    lastCalibrated: '2024-11-15',
    firmwareVersion: 'v3.2.1',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM002',
    assignedWorker: 'Mona Singh',
    workerId: 'WRK002',
    assignmentDate: '2024-01-12',
    lastCalibrated: '2024-11-14',
    firmwareVersion: 'v3.2.1',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM003',
    assignedWorker: 'Asmita',
    workerId: 'WRK003',
    assignmentDate: '2024-01-15',
    lastCalibrated: '2024-11-10',
    firmwareVersion: 'v3.2.0',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM004',
    assignedWorker: 'Anju',
    workerId: 'WRK004',
    assignmentDate: '2024-02-01',
    lastCalibrated: '2024-11-15',
    firmwareVersion: 'v3.2.1',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM005',
    assignedWorker: 'Nizaam Ali',
    workerId: 'WRK005',
    assignmentDate: '2024-02-05',
    lastCalibrated: '2024-11-12',
    firmwareVersion: 'v3.1.9',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM006',
    assignedWorker: 'Lata',
    workerId: 'WRK006',
    assignmentDate: '2024-02-08',
    lastCalibrated: '2024-11-15',
    firmwareVersion: 'v3.2.1',
    status: 'Assigned',
  },
  {
    helmetId: 'HLM007',
    assignedWorker: 'Unassigned',
    workerId: 'N/A',
    assignmentDate: 'N/A',
    lastCalibrated: '2024-11-01',
    firmwareVersion: 'v3.2.1',
    status: 'Available',
  },
  {
    helmetId: 'HLM008',
    assignedWorker: 'Maintenance',
    workerId: 'N/A',
    assignmentDate: 'N/A',
    lastCalibrated: '2024-10-15',
    firmwareVersion: 'v3.1.8',
    status: 'Maintenance',
  },
]

export default function HelmetAssignmentTable() {
  const [sortField, setSortField] = useState('helmetId')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredAndSorted = useMemo(() => {
    let filtered = MOCK_HELMETS

    if (filterStatus !== 'All') {
      filtered = filtered.filter((helmet) => helmet.status === filterStatus)
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [sortField, sortDirection, filterStatus])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // --- Theme Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Assigned':
        return 'bg-teal-900/50 text-teal-400 border border-teal-700/50' // Green/Teal for Assigned
      case 'Available':
        return 'bg-yellow-900/50 text-yellow-400 border border-yellow-700/50' // Yellow/Gold for Available
      case 'Maintenance':
        return 'bg-red-900/50 text-red-400 border border-red-700/50' // Red for Maintenance
      default:
        return 'bg-gray-700 text-gray-400 border border-gray-600'
    }
  }

  // Base class for filter buttons
  const baseFilterButtonClass = 'px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.05]';
  const activeButtonClass = 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-md shadow-yellow-500/30';
  const inactiveButtonClass = 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap animate-slide-in-down">
        {['All', 'Assigned', 'Available', 'Maintenance'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`${baseFilterButtonClass} ${
              filterStatus === status
                ? activeButtonClass
                : inactiveButtonClass
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg shadow-xl shadow-gray-950/50 animate-fade-in-up">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800">
              {[
                'helmetId',
                'assignedWorker',
                'workerId',
                'assignmentDate',
                'lastCalibrated',
                'firmwareVersion',
                'status',
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
            {filteredAndSorted.map((helmet, index) => (
              <tr
                key={helmet.helmetId}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200"
                // Added staggered animation for rows
                style={{ animation: `slide-in-row 0.3s ease-out forwards ${index * 0.05}s`}}
              >
                <td className="px-4 py-3 text-sm font-mono text-yellow-500 font-bold">
                  {helmet.helmetId}
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {helmet.assignedWorker}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-400">
                  {helmet.workerId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {helmet.assignmentDate}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {helmet.lastCalibrated}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-300">
                  {helmet.firmwareVersion}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      helmet.status
                    )}`}
                  >
                    {helmet.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 animate-fade-in-up">
        Showing {filteredAndSorted.length} of {MOCK_HELMETS.length} helmets
      </div>
    </div>
  )
}