/**
 * Authentication Routes
 */
import express from 'express'
import AdminUser from '../models/AdminUser.js'
import Organization from '../models/Organization.js'
import { generateToken } from '../utils/jwt.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

/**
 * POST /auth/register
 * Register first admin user and create organization
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organizationName, industry } = req.body

    // Validate input
    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      })
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      industry: industry || 'SaaS',
    })

    // Create admin user (first user is Owner)
    const user = await AdminUser.create({
      organizationId: organization._id,
      name,
      email,
      password,
      role: 'Owner',
    })

    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
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
 * POST /auth/login
 * Login admin user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
      })
    }

    const user = await AdminUser.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      })
    }

    // password from client is already SHA-256 hashed
    // comparePassword will handle the comparison with stored bcrypt hash
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken(user._id)

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
        },
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
 * GET /auth/me
 * Get current authenticated user
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await AdminUser.findById(req.user._id)
      .select('-password')
      .populate('organizationId', 'name industry timezone currency')

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

