/**
 * Report Routes
 */
import express from 'express'
import mongoose from 'mongoose'
import Report from '../models/Report.js'
import Customer from '../models/Customer.js'
import Subscription from '../models/Subscription.js'
import Transaction from '../models/Transaction.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

/**
 * GET /reports
 * Get all reports
 */
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query
    const organizationId = req.organizationId

    const query = { organizationId }
    if (type) query.type = type
    if (status) query.status = status

    const reports = await Report.find(query).sort({ createdAt: -1 })

    res.json({
      success: true,
      data: reports,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /reports/:id/download
 * Download report as CSV or JSON
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params
    const { format = 'csv' } = req.query
    const organizationId = req.organizationId

    const report = await Report.findOne({ _id: id, organizationId })

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found',
      })
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Report is not ready for download',
      })
    }

    const filename = `report-${report.type}-${id}`

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.json`)
      return res.send(JSON.stringify(report, null, 2))
    }

    // Default to CSV
    const summary = report.summary
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', summary.totalUsers],
      ['Active Users', summary.activeUsers],
      ['Revenue', summary.revenue],
      ['Churn Rate (%)', summary.churnRate],
      ['MRR', summary.mrr],
      ['ARR', summary.arr],
      ['Period Start', report.periodStart.toISOString()],
      ['Period End', report.periodEnd.toISOString()],
      ['Generated At', report.createdAt.toISOString()],
    ]

    const csvString = csvData.map(row => row.join(',')).join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`)
    res.send(csvString)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /reports
 * Generate new report
 */
router.post('/', async (req, res) => {
  try {
    const { type, periodStart, periodEnd } = req.body
    const organizationId = req.organizationId

    if (!type || !periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        error: 'Type, periodStart, and periodEnd are required',
      })
    }

    // Create report with pending status
    const report = await Report.create({
      organizationId,
      type,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      status: 'pending',
    })

    // Generate report summary asynchronously (in real app, use a job queue)
    generateReportSummary(report._id, organizationId, periodStart, periodEnd)

    res.status(201).json({
      success: true,
      data: report,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * Helper function to generate report summary
 */
async function generateReportSummary(reportId, organizationId, periodStart, periodEnd) {
  try {
    const startDate = new Date(periodStart)
    const endDate = new Date(periodEnd)

    // Calculate metrics
    const totalUsers = await Customer.countDocuments({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      signupDate: { $lte: endDate },
    })

    const activeUsers = await Customer.countDocuments({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      lastActiveAt: { $gte: startDate, $lte: endDate },
    })

    const revenue = await Transaction.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: 'success',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ])

    const activeSubscriptions = await Subscription.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: 'active',
    })

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.pricePerMonth, 0)
    const arr = mrr * 12

    // Calculate churn rate
    const cancelledSubscriptions = await Subscription.countDocuments({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      status: 'cancelled',
      endDate: { $gte: startDate, $lte: endDate },
    })

    const totalSubscriptions = await Subscription.countDocuments({
      organizationId: new mongoose.Types.ObjectId(organizationId),
    })

    const churnRate = totalSubscriptions > 0 ? cancelledSubscriptions / totalSubscriptions : 0

    // Update report with summary
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      summary: {
        totalUsers,
        activeUsers,
        revenue: revenue[0]?.total || 0,
        churnRate: Math.round(churnRate * 100) / 100,
        mrr,
        arr,
      },
    })
  } catch (error) {
    console.error('Error generating report summary:', error)
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      summary: {
        totalUsers: 0,
        activeUsers: 0,
        revenue: 0,
        churnRate: 0,
        mrr: 0,
        arr: 0,
      },
    })
  }
}

export default router

