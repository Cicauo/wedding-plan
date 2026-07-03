import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Wedding Plan API is running 🎊' })
})

// Mock: Get wedding info
app.get('/api/wedding', (_req, res) => {
  res.json({
    coupleName: 'Sarah & James',
    weddingDate: '2026-09-12',
    venue: 'The Grand Ballroom',
    guestCount: 120,
    budget: {
      total: 50000000,
      used: 22500000,
    },
  })
})

// Mock: Get tasks
app.get('/api/tasks', (_req, res) => {
  res.json([
    { id: 1, title: 'Book venue', done: true },
    { id: 2, title: 'Send invitations', done: true },
    { id: 3, title: 'Confirm catering', done: false },
    { id: 4, title: 'Book photographer', done: false },
    { id: 5, title: 'Order wedding cake', done: false },
  ])
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

export default app
