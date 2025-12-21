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
      const customerObj = customer.toObject()
      return {
        ...customerObj,
        id: customerObj._id.toString(), // Add 'id' field for frontend compatibility
        _id: customerObj._id.toString(), // Keep _id as string for consistency
        plan: sub ? sub.plan : 'Free',
      }
    })

    res.json({
      success: true,
      data: {
        data: itemsWithPlan, // Use 'data' instead of 'items' to match PaginatedResponse interface
        total,
        page: parseInt(page),
        pageSize: parseInt(limit), // Use 'pageSize' instead of 'limit' to match PaginatedResponse interface
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

    // Get active subscription to show current plan
    const activeSubscription = subscriptions.find((sub) => sub.status === 'active')
    const customerObj = customer.toObject()
    customerObj.plan = activeSubscription ? activeSubscription.plan : 'Free'

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
        customer: customerObj,
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
    const { name, email, region, status = 'active', plan = 'Free' } = req.body
    const organizationId = req.organizationId

    if (!name || !email || !region) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and region are required',
      })
    }

    // Plan prices (auto-calculated)
    const planPrices = {
      Free: 0,
      Basic: 29,
      Pro: 99,
    }

    const pricePerMonth = planPrices[plan] || 0

    const customer = await Customer.create({
      organizationId,
      name,
      email,
      region,
      status,
      signupDate: new Date(),
      lastActiveAt: new Date(),
    })

    // Create subscription for the selected plan
    const subscription = await Subscription.create({
      organizationId,
      customerId: customer._id,
      plan,
      pricePerMonth,
      status: 'active',
      startDate: new Date(),
    })

    // Create an initial successful transaction for paid plans
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

    // Extract plan if provided (will handle subscription separately)
    const { plan, ...customerUpdates } = updates

    // Remove fields that shouldn't be updated directly
    delete customerUpdates._id
    delete customerUpdates.organizationId
    delete customerUpdates.createdAt

    // Check if customer has active paid subscriptions (Basic or Pro)
    // If they do, prevent status updates (except to 'churned' which cancels subscriptions)
    // BUT: Allow status updates if we're also updating the plan (which will handle subscription changes)
    if (customerUpdates.status && customerUpdates.status !== 'churned' && plan === undefined) {
      const activePaidSubscriptions = await Subscription.countDocuments({
        customerId: id,
        organizationId,
        status: 'active',
        plan: { $in: ['Basic', 'Pro'] },
      })

      if (activePaidSubscriptions > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot update customer status while they have active paid subscriptions (Basic or Pro). Please cancel their subscriptions first, or set status to "churned" to automatically cancel them.',
        })
      }
    }

    // Handle plan update if provided
    // Process plan updates regardless of status - we'll set status to 'active' for paid plans anyway
    if (plan !== undefined) {
      const planPrices = {
        Free: 0,
        Basic: 29,
        Pro: 99,
      }

      // Check if user has an active Basic or Pro subscription
      const activePaidSubscription = await Subscription.findOne({
        customerId: id,
        organizationId,
        status: 'active',
        plan: { $in: ['Basic', 'Pro'] },
      })

      // If user has active Basic/Pro subscription, they must cancel it first
      if (activePaidSubscription) {
        return res.status(400).json({
          success: false,
          error: `Cannot update subscription plan. User has an active ${activePaidSubscription.plan} subscription. Please cancel the current subscription first before creating a new one.`,
        })
      }

      // User doesn't have active Basic/Pro subscription - can create/upgrade freely
      // Find any active subscription (could be Free or none)
      const activeSubscription = await Subscription.findOne({
        customerId: id,
        organizationId,
        status: 'active',
      })

      // Cancel any existing active subscription (Free or otherwise)
      if (activeSubscription) {
        activeSubscription.status = 'cancelled'
        activeSubscription.endDate = new Date()
        await activeSubscription.save()
      }

      // Create new subscription with the selected plan
      const newSubscription = await Subscription.create({
        organizationId,
        customerId: id,
        plan,
        pricePerMonth: planPrices[plan] || 0,
        status: 'active',
        startDate: new Date(),
      })

      // Create transaction if it's a paid plan (Basic or Pro)
      if (planPrices[plan] > 0) {
        await Transaction.create({
          organizationId,
          customerId: id,
          subscriptionId: newSubscription._id,
          amount: planPrices[plan],
          currency: 'USD',
          status: 'success',
        })

        // When creating/upgrading to Basic/Pro, always set user status to 'active'
        // This applies regardless of current user status (churned, inactive, etc.)
        // Override any status that was passed - paid subscribers should be active
        customerUpdates.status = 'active'
      }
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: id, organizationId },
      { $set: customerUpdates },
      { new: true, runValidators: true }
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      })
    }

    // If status changed to churned, cancel all active subscriptions
    // When a user is churned, all their subscriptions are cancelled
    // They will effectively have no active subscription (plan shows as Free by default)
    if (customerUpdates.status === 'churned') {
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
      // Note: We don't create a Free subscription here because churned users shouldn't have active subscriptions
      // The UI will show "Free" as the plan because they have no active paid subscription
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

