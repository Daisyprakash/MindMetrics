/**
 * Customer Routes
 * CRUD operations for customers
 */
import express from 'express'
import Customer from '../models/Customer.js'
import Subscription from '../models/Subscription.js'
import Transaction from '../models/Transaction.js'
import UsageEvent from '../models/UsageEvent.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * GET /customers
 * Get all customers with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      status,
      region,
      page = 1,
      limit = 20,
      sortBy = 'signupDate',
      sortOrder = 'desc',
    } = req.query

    const organizationId = req.organizationId
    const query = { organizationId }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    // Status filter
    if (status) {
      query.status = status
    }

    // Region filter
    if (region) {
      query.region = region
    }

    // Sorting
    const sort = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [items, total] = await Promise.all([
      Customer.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(query),
    ])

    // Fetch active subscriptions for these customers to show the plan in the table
    const customerIds = items.map((customer) => customer._id)
    const subscriptions = await Subscription.find({
      organizationId,
      customerId: { $in: customerIds },
      status: 'active',
    })

    const itemsWithPlan = items.map((customer) => {
      const sub = subscriptions.find(
        (s) => s.customerId.toString() === customer._id.toString()
      )
      return {
        ...customer.toObject(),
        plan: sub ? sub.plan : 'Free',
      }
    })

    res.json({
      success: true,
      data: {
        items: itemsWithPlan,
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
 * GET /customers/:id
 * Get single customer with subscription and activity
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId

    const customer = await Customer.findOne({
      _id: id,
      organizationId,
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      })
    }

    // Get subscriptions
    const subscriptions = await Subscription.find({
      customerId: id,
      organizationId,
    })

    // Get recent activity
    const recentActivity = await UsageEvent.find({
      customerId: id,
      organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({
      success: true,
      data: {
        customer,
        subscriptions,
        recentActivity,
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
 * POST /customers
 * Create new customer with optional initial subscription
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, region, status = 'active', plan, pricePerMonth } = req.body
    const organizationId = req.organizationId

    if (!name || !email || !region) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and region are required',
      })
    }

    const customer = await Customer.create({
      organizationId,
      name,
      email,
      region,
      status,
      signupDate: new Date(),
      lastActiveAt: new Date(),
    })

    // If plan details are provided, create a subscription and an initial transaction
    if (plan && plan !== 'Free') {
      const subscription = await Subscription.create({
        organizationId,
        customerId: customer._id,
        plan,
        pricePerMonth: pricePerMonth || 0,
        status: 'active',
        startDate: new Date(),
      })

      // Create an initial successful transaction for the first month
      if (pricePerMonth > 0) {
        await Transaction.create({
          organizationId,
          customerId: customer._id,
          subscriptionId: subscription._id,
          amount: pricePerMonth,
          currency: 'USD',
          status: 'success',
        })
      }
    } else if (plan === 'Free') {
      await Subscription.create({
        organizationId,
        customerId: customer._id,
        plan: 'Free',
        pricePerMonth: 0,
        status: 'active',
        startDate: new Date(),
      })
    }

    res.status(201).json({
      success: true,
      data: customer,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Customer with this email already exists',
      })
    }
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * PUT /customers/:id
 * Update customer
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId
    const updates = req.body

    // Remove fields that shouldn't be updated directly
    delete updates._id
    delete updates.organizationId
    delete updates.createdAt

    const customer = await Customer.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      })
    }

    // If status changed to churned, cancel active subscriptions
    if (updates.status === 'churned') {
      await Subscription.updateMany(
        {
          customerId: id,
          organizationId,
          status: 'active',
        },
        {
          $set: {
            status: 'cancelled',
            endDate: new Date(),
          },
        }
      )
    }

    res.json({
      success: true,
      data: customer,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * DELETE /customers/:id
 * Delete customer (soft delete by setting status to churned)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const organizationId = req.organizationId

    const customer = await Customer.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: { status: 'churned' } },
      { new: true }
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      })
    }

    // Cancel all subscriptions
    await Subscription.updateMany(
      {
        customerId: id,
        organizationId,
      },
      {
        $set: {
          status: 'cancelled',
          endDate: new Date(),
        },
      }
    )

    res.json({
      success: true,
      data: { _id: id },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

