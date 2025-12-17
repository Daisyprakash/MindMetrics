/**
 * Transaction Routes
 */
import express from 'express'
import Transaction from '../models/Transaction.js'
import Subscription from '../models/Subscription.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

/**
 * GET /transactions
 * Get all transactions with filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      userId,
      subscriptionId,
      from,
      to,
      status,
      page = 1,
      limit = 20,
    } = req.query

    const organizationId = req.organizationId
    const query = { organizationId }

    if (userId) query.customerId = userId
    if (subscriptionId) query.subscriptionId = subscriptionId
    if (status) query.status = status

    if (from || to) {
      query.createdAt = {}
      if (from) query.createdAt.$gte = new Date(from)
      if (to) query.createdAt.$lte = new Date(to)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [items, total] = await Promise.all([
      Transaction.find(query)
        .populate('customerId', 'name email')
        .populate('subscriptionId', 'plan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query),
    ])

    res.json({
      success: true,
      data: {
        items,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /transactions
 * Create new transaction
 */
router.post('/', async (req, res) => {
  try {
    const { subscriptionId, amount, currency = 'USD', status = 'success' } = req.body
    const organizationId = req.organizationId

    if (!subscriptionId || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID and amount are required',
      })
    }

    // Verify subscription exists
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      organizationId,
    })

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      })
    }

    const transaction = await Transaction.create({
      organizationId,
      customerId: subscription.customerId,
      subscriptionId,
      amount,
      currency,
      status,
    })

    res.status(201).json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

