/**
 * UsageEvent Model
 * Represents customer activity/usage events
 */
import mongoose from 'mongoose'

const usageEventSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ['login', 'session', 'feature_used'],
      required: true,
    },
    feature: {
      type: String,
    },
    sessionDuration: {
      type: Number, // in seconds
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for analytics queries
usageEventSchema.index({ organizationId: 1, createdAt: -1 })
usageEventSchema.index({ customerId: 1, createdAt: -1 })
usageEventSchema.index({ organizationId: 1, eventType: 1, createdAt: -1 })

export default mongoose.model('UsageEvent', usageEventSchema)

