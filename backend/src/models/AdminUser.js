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
  
  // Check if password is already a SHA-256 hash (64 hex characters)
  const isSha256Hash = /^[a-f0-9]{64}$/i.test(this.password)
  
  if (isSha256Hash) {
    // Password is SHA-256 hashed from client
    // Hash it with bcrypt for storage (bcrypt adds unique salt per password)
    this.password = await bcrypt.hash(this.password, 10)
  } else {
    // Backward compatibility: if it's a plain password, hash with bcrypt
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

// Compare password method
// candidatePassword: SHA-256 hashed from client (no salt)
// stored password: bcrypt(SHA-256(password)) with unique salt
adminUserSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Check if stored password is bcrypt hashed (starts with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$/.test(this.password)
    
    if (isBcryptHash) {
      // Stored: bcrypt(SHA-256(password)) with unique salt
      // Candidate: SHA-256(password) from client
      // bcrypt.compare extracts salt from stored, hashes candidate with that salt, and compares
      return await bcrypt.compare(candidatePassword, this.password)
    } else {
      // Backward compatibility: stored password might be plain SHA-256 (very old format)
      const isStoredSha256 = /^[a-f0-9]{64}$/i.test(this.password)
      const isCandidateSha256 = /^[a-f0-9]{64}$/i.test(candidatePassword)
      
      if (isStoredSha256 && isCandidateSha256) {
        return this.password.toLowerCase() === candidatePassword.toLowerCase()
      }
      
      return false
    }
  } catch (error) {
    console.error('Password comparison error:', error)
    return false
  }
}

export default mongoose.model('AdminUser', adminUserSchema)

