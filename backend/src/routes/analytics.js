/**
 * Analytics Routes
 * Dashboard and analytics endpoints
 */
import express from 'express'
import mongoose from 'mongoose'
import Customer from '../models/Customer.js'
import Subscription from '../models/Subscription.js'
import Transaction from '../models/Transaction.js'
import UsageEvent from '../models/UsageEvent.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

/**
 * GET /analytics/overview
 * Get dashboard KPIs
 */
router.get('/overview', async (req, res) => {
  try {
    const { from, to } = req.query
    const organizationId = req.organizationId

    // Date range (default to last 30 days)
    const toDate = to ? new Date(to) : new Date()
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Total users
    const totalUsers = await Customer.countDocuments({ organizationId })

    // Active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeUsers = await Customer.countDocuments({
      organizationId,
      lastActiveAt: { $gte: sevenDaysAgo },
    })

    // MRR (Monthly Recurring Revenue)
    const activeSubscriptions = await Subscription.find({
      organizationId,
      status: 'active',
    })
    const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.pricePerMonth, 0)

    // Monthly Revenue (from transactions in date range)
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: 'success',
          createdAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ])
    const revenue = monthlyRevenue[0]?.total || 0

    // Conversion rate (paid users / total users)
    const paidUsers = await Subscription.distinct('customerId', {
      organizationId,
      status: 'active',
      plan: { $ne: 'Free' },
    })
    const conversionRate = totalUsers > 0 ? paidUsers.length / totalUsers : 0

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        mrr,
        monthlyRevenue: revenue,
        conversionRate: Math.round(conversionRate * 100) / 100,
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
 * GET /analytics/trends
 * Get trend data for charts
 */
router.get('/trends', async (req, res) => {
  try {
    const { metric, from, to, groupBy = 'day' } = req.query
    const organizationId = req.organizationId

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const toDate = to ? new Date(to) : new Date()

    let data = []

    if (metric === 'users') {
      // Count users by date (signupDate)
      data = await Customer.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(organizationId),
            signupDate: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
                date: '$signupDate',
              },
            },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
    } else if (metric === 'revenue') {
      // Sum revenue by date
      data = await Transaction.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(organizationId),
            status: 'success',
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            value: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ])
    } else if (metric === 'sessions') {
      // Count sessions by date
      data = await UsageEvent.aggregate([
        {
          $match: {
            organizationId: new mongoose.Types.ObjectId(organizationId),
            eventType: 'session',
            createdAt: { $gte: fromDate, $lte: toDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
                date: '$createdAt',
              },
            },
            value: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
    }

    const formattedData = data.map((item) => ({
      date: item._id,
      value: item.value,
    }))

    res.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /analytics/retention
 * Get retention data by cohort
 */
router.get('/retention', async (req, res) => {
  try {
    const organizationId = req.organizationId

    // Group customers by signup month (cohort)
    const cohorts = await Customer.aggregate([
      {
        $match: { organizationId: new mongoose.Types.ObjectId(organizationId) },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$signupDate' },
          },
          usersSignedUp: { $sum: 1 },
          users: { $push: '$_id' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Calculate retention for each cohort
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const retentionData = await Promise.all(
      cohorts.map(async (cohort) => {
        const usersReturning = await Customer.countDocuments({
          _id: { $in: cohort.users },
          lastActiveAt: { $gte: sevenDaysAgo },
        })

        return {
          cohort: cohort._id,
          usersSignedUp: cohort.usersSignedUp,
          usersReturning,
          retentionRate: cohort.usersSignedUp > 0 ? usersReturning / cohort.usersSignedUp : 0,
        }
      })
    )

    res.json({
      success: true,
      data: retentionData,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

