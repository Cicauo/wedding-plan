import { useState } from 'react'
import { Users, UserPlus, Search } from 'lucide-react'

type GuestStatus = 'confirmed' | 'pending' | 'declined'

interface Guest {
  id: number
  name: string
  email: string
  table: number
  status: GuestStatus
}

const mockGuests: Guest[] = [
  { id: 1, name: 'Budi Santoso', email: 'budi@email.com', table: 1, status: 'confirmed' },
  { id: 2, name: 'Siti Rahma', email: 'siti@email.com', table: 1, status: 'confirmed' },
  { id: 3, name: 'Ahmad Fauzi', email: 'ahmad@email.com', table: 2, status: 'pending' },
  { id: 4, name: 'Dewi Lestari', email: 'dewi@email.com', table: 2, status: 'declined' },
  { id: 5, name: 'Rizki Pratama', email: 'rizki@email.com', table: 3, status: 'pending' },
]

const statusColors: Record<GuestStatus, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  declined: 'bg-red-100 text-red-700',
}

export default function GuestList() {
  const [search, setSearch] = useState('')

  const filtered = mockGuests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    confirmed: mockGuests.filter((g) => g.status === 'confirmed').length,
    pending: mockGuests.filter((g) => g.status === 'pending').length,
    declined: mockGuests.filter((g) => g.status === 'declined').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-rose-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest List</h1>
            <p className="text-gray-500 text-sm">Manage your wedding guests</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{counts.confirmed}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{counts.declined}</p>
            <p className="text-sm text-gray-500">Declined</p>
          </div>
        </div>

        {/* Search + Add */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <button className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Guest
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Table</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((guest, i) => (
                <tr key={guest.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-4 py-3 font-medium text-gray-900">{guest.name}</td>
                  <td className="px-4 py-3 text-gray-500">{guest.email}</td>
                  <td className="px-4 py-3 text-gray-500">Table {guest.table}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[guest.status]}`}>
                      {guest.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No guests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
