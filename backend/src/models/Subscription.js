/**
 * Subscription Model
 * Represents customer subscription plans
 */
import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
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
    },
    plan: {
      type: String,
      enum: ['Free', 'Basic', 'Pro'],
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'cancelled'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
subscriptionSchema.index({ organizationId: 1, status: 1 })
subscriptionSchema.index({ customerId: 1 })

export default mongoose.model('Subscription', subscriptionSchema)

