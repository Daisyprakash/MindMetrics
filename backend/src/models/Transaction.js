/**
 * Transaction Model
 * Represents payment transactions
 */
import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
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
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
transactionSchema.index({ organizationId: 1, createdAt: -1 })
transactionSchema.index({ customerId: 1 })
transactionSchema.index({ subscriptionId: 1 })

export default mongoose.model('Transaction', transactionSchema)

