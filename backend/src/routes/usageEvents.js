/**
 * UsageEvent Routes
 */
import express from 'express'
import UsageEvent from '../models/UsageEvent.js'
import Customer from '../models/Customer.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

/**
 * GET /usage-events
 * Get usage events with filtering
 */
router.get('/', async (req, res) => {
  try {
    const { userId, from, to, eventType, feature } = req.query
    const organizationId = req.organizationId

    const query = { organizationId }

    if (userId) query.customerId = userId
    if (eventType) query.eventType = eventType
    if (feature) query.feature = feature

    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from)
      if (to) query.createdAt.$lte = new Date(to)
    }

    const events = await UsageEvent.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(1000) // Limit to prevent huge responses

    res.json({
      success: true,
      data: events,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /usage-events
 * Create usage event
 */
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      eventType,
      feature,
      sessionDuration,
    } = req.body
    const organizationId = req.organizationId

    if (!customerId || !eventType) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and event type are required',
      })
    }

    const event = await UsageEvent.create({
      organizationId,
      customerId,
      eventType,
      feature,
      sessionDuration,
    })

    // Update customer's lastActiveAt
    await Customer.findByIdAndUpdate(customerId, {
      lastActiveAt: new Date(),
    })

    res.status(201).json({
      success: true,
      data: event,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

