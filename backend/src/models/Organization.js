/**
 * Organization Model
 * Represents the company using the SaaS analytics platform
 */
import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      enum: ['SaaS', 'Ecommerce', 'Fintech'],
      default: 'SaaS',
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'INR'],
      default: 'USD',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Organization', organizationSchema)

