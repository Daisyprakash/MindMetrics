/**
 * JWT Authentication Middleware
 */
import jwt from 'jsonwebtoken'
import AdminUser from '../models/AdminUser.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await AdminUser.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      })
    }

    req.user = user
    req.organizationId = user.organizationId.toString()
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    })
  }
}

