/**
 * AdminUser Model
 * Represents the owners/admins using this CRM software
 */
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminUserSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['Owner', 'Admin', 'Viewer'],
      default: 'Admin',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
adminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password method
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('AdminUser', adminUserSchema)

