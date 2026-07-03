import { Users, Calendar, CheckSquare, DollarSign } from 'lucide-react'

const stats = [
  { label: 'Guests', value: '120', icon: Users, color: 'text-blue-600' },
  { label: 'Days Left', value: '87', icon: Calendar, color: 'text-rose-600' },
  { label: 'Tasks Done', value: '12/30', icon: CheckSquare, color: 'text-green-600' },
  { label: 'Budget Used', value: '45%', icon: DollarSign, color: 'text-amber-600' },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Wedding Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your big day is coming up! 💍</p>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <p className="text-gray-500">
            More features coming soon — venue, catering, guest list, and more! 🎊
          </p>
        </div>
      </main>
    </div>
  )
}
