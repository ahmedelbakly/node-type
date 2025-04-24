import { Request, Response, NextFunction, RequestHandler } from 'express'
import helpers from '../utils/helpers.js'
import User from '../models/userModel.js'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

const authMiddleware = {
  // Verify JWT token
  verifyToken: (async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '')

      if (!token) {
        helpers.errorResponse(res, 'Authentication required', 401)
        return
      }

      // Verify token
      const decoded = helpers.verifyToken(token) as {
        id: string
        email: string
      }

      console.log('decoded', decoded);
      

      // Find user and attach to request
      const user = await User.findOne({
        _id: decoded.id,
        email: decoded.email
      }).select('-password')

      if (!user) {
        helpers.errorResponse(res, 'User not found', 404)
        return
      }

      req.user = {
        id: user.id.toString(),
        email: user.email
      }

      next()
    } catch (error) {
      helpers.errorResponse(res, 'Invalid or expired token', 401, error)
    }
  }) as RequestHandler, // Type assertion here

  // Check user roles
  checkRole: (roles: string[]) => {
    return (async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user) {
          helpers.errorResponse(res, 'Authentication required', 401)
          return
        }

        const user = await User.findById(req.user.id)
        if (!user || !roles.includes(user.role)) {
          helpers.errorResponse(res, 'Unauthorized access', 403)
          return
        }

        next()
      } catch (error) {
        helpers.errorResponse(res, 'Authorization failed', 500, error)
      }
    }) as RequestHandler // Type assertion here
  },

  // Optional authentication
  optionalAuth: (async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '')

      if (token) {
        const decoded = helpers.verifyToken(token) as {
          id: string
          email: string
        }
        const user = await User.findOne({
          _id: decoded.id,
          email: decoded.email
        }).select('-password')

        if (user) {
          req.user = {
            id: user.id.toString(),
            email: user.email
          }
        }
      }

      next()
    } catch (error) {
      next()
    }
  }) as RequestHandler // Type assertion here
}

export default authMiddleware
