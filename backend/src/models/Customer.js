/**
 * Customer Model
 * Represents the end users/customers of the SaaS product being tracked
 */
import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'churned'],
      default: 'active',
      index: true,
    },
    region: {
      type: String,
      required: true,
    },
    signupDate: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better query performance
customerSchema.index({ organizationId: 1, status: 1 })
customerSchema.index({ organizationId: 1, email: 1 })

export default mongoose.model('Customer', customerSchema)

