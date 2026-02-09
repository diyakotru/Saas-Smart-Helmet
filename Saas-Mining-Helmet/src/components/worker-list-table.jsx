'use client'

import { useState, useMemo } from 'react'
import { Card } from '../components/ui/card'

const MOCK_WORKERS = [
  {
    workerId: 'WRK001',
    name: 'Ram pujari', 
    department: 'Foundation',
    email: 'a.b@construction.com',
    phone: '555-0101',
    joinDate: '2023-01-15',
    status: 'Active',
  },
  {
    workerId: 'WRK002',
    name: 'Asmita',
    department: 'Roofing',
    email: 'a.b@construction.com',
    phone: '555-0102',
    joinDate: '2023-02-20',
    status: 'Active',
  },
  {
    workerId: 'WRK003',
    name: 'Mona Singh',
    department: 'Electrical',
    email: 'a.b@construction.com',
    phone: '555-0103',
    joinDate: '2023-03-10',
    status: 'Active',
  },
  {
    workerId: 'WRK004',
    name: 'Nizaam Ali',
    department: 'HVAC',
    email: 'a.b@construction.com',
    phone: '555-0104',
    joinDate: '2023-04-05',
    status: 'Active',
  },
  {
    workerId: 'WRK005',
    name: 'Anju',
    department: 'Carpentry',
    email: 'a.b@construction.com',
    phone: '555-0105',
    joinDate: '2023-05-12',
    status: 'Active',
  },
  {
    workerId: 'WRK006',
    name: 'Lata',
    department: 'Plumbing',
    email: 'a.b@construction.com',
    phone: '555-0106',
    joinDate: '2023-06-08',
    status: 'Active',
  },
]

export default function WorkerListTable() {
  const [sortField, setSortField] = useState('workerId')
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAndSorted = useMemo(() => {
    let filtered = MOCK_WORKERS.filter((worker) =>
      Object.values(worker).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    )

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [sortField, sortDirection, searchQuery])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Theme helper for status badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-teal-900/50 text-teal-400 border border-teal-700/50' // Use teal for active/good status
      default:
        return 'bg-gray-700 text-gray-400 border border-gray-600'
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Search */}
      <input
        type="text"
        placeholder="Search workers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-700 rounded-lg text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-300 animate-slide-in-down"
      />

      {/* Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-lg shadow-xl shadow-gray-950/50 animate-fade-in-up">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800">
              {[
                'workerId',
                'name',
                'department',
                'email',
                'phone',
                'joinDate',
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
            {filteredAndSorted.map((worker) => (
              <tr
                key={worker.workerId}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200 animate-slide-in-row"
              >
                <td className="px-4 py-3 text-sm font-mono text-yellow-500">
                  {worker.workerId}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-white">{worker.name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{worker.department}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{worker.email}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{worker.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{worker.joinDate}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(worker.status)}`}>
                    {worker.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-500 animate-fade-in-up">
        Showing {filteredAndSorted.length} of {MOCK_WORKERS.length} workers
      </div>
    </div>
  )
}