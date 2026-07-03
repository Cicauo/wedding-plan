import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
        </div>
        <h1 className="text-5xl font-bold text-rose-700 mb-4">
          Wedding Planner
        </h1>
        <p className="text-xl text-rose-500 mb-8">
          Plan your perfect day, stress-free ✨
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-700 transition-colors"
        >
          Start Planning
        </Link>
      </div>
    </main>
  )
}
