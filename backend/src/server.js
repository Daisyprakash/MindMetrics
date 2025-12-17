/**
 * Express Server
 * Main entry point for the backend API
 */
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database.js'

// Routes
import authRoutes from './routes/auth.js'
import analyticsRoutes from './routes/analytics.js'
import customerRoutes from './routes/customers.js'
import subscriptionRoutes from './routes/subscriptions.js'
import transactionRoutes from './routes/transactions.js'
import usageEventRoutes from './routes/usageEvents.js'
import reportRoutes from './routes/reports.js'
import settingsRoutes from './routes/settings.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/subscriptions', subscriptionRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/usage-events', usageEventRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingsRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  })
})

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase()

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📊 API available at http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

