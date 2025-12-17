/**
 * Settings/Organization Routes
 */
import express from 'express'
import Organization from '../models/Organization.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

/**
 * GET /settings/organization
 * Get organization settings
 */
router.get('/organization', async (req, res) => {
  try {
    const organizationId = req.organizationId

    const organization = await Organization.findById(organizationId)

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      })
    }

    res.json({
      success: true,
      data: organization,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * PUT /settings/organization
 * Update organization settings
 */
router.put('/organization', async (req, res) => {
  try {
    const organizationId = req.organizationId
    const updates = req.body

    // Remove fields that shouldn't be updated
    delete updates._id
    delete updates.createdAt

    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found',
      })
    }

    res.json({
      success: true,
      data: organization,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router

