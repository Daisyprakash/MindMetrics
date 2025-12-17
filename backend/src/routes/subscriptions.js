/**
 * Subscription Routes
 */
import express from 'express'
import Subscription from '../models/Subscription.js'
import Customer from '../models/Customer.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

/**
 * GET /subscriptions
 * Get all subscriptions
 */
router.get('/', async (req, res) => {
  try {
    const { status, plan, customerId } = req.query
    const organizationId = req.organizationId

    const query = { organizationId }
    if (status) query.status = status
    if (plan) query.plan = plan
    if (customerId) query.customerId = customerId

    const subscriptions = await Subscription.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: subscriptions,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /subscriptions/:id
 * Get single subscription
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId

    const subscription = await Subscription.findOne({
      _id: id,
      organizationId,
    }).populate('customerId', 'name email')

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      })
    }

    res.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /subscriptions
 * Create new subscription
 */
router.post('/', async (req, res) => {
  try {
    const { customerId, plan, pricePerMonth, status = 'active' } = req.body
    const organizationId = req.organizationId

    if (!customerId || !plan) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and plan are required',
      })
    }

    // Verify customer exists and belongs to organization
    const customer = await Customer.findOne({
      _id: customerId,
      organizationId,
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      })
    }

    const planPrices = {
      Free: 0,
      Basic: 29,
      Pro: 99,
    }

    const subscription = await Subscription.create({
      organizationId,
      customerId,
      plan,
      pricePerMonth: pricePerMonth || planPrices[plan] || 0,
      status,
      startDate: new Date(),
    })

    res.status(201).json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * PUT /subscriptions/:id
 * Update subscription
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId
    const updates = req.body

    delete updates._id
    delete updates.organizationId
    delete updates.customerId

    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      })
    }

    res.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * DELETE /subscriptions/:id
 * Cancel subscription
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId

    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, organizationId },
      {
        $set: {
          status: 'cancelled',
          endDate: new Date(),
        },
      },
      { new: true }
    )

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found',
      })
    }

    res.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

