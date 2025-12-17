/**
 * Report Model
 * Represents generated analytics reports
 */
import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['monthly', 'yearly', 'custom'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    summary: {
      totalUsers: Number,
      activeUsers: Number,
      revenue: Number,
      churnRate: Number,
      mrr: Number,
      arr: Number,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
reportSchema.index({ organizationId: 1, createdAt: -1 })
reportSchema.index({ organizationId: 1, type: 1 })

export default mongoose.model('Report', reportSchema)

