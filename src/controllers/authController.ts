import { Request, Response } from 'express'
import User, { IUser } from '../models/userModel.js'
import helpers from '../utils/helpers.js'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
  }
}

class AuthController {
  // Register new user
  public async register (req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body

      if (!helpers.validateEmail(email)) {
        helpers.errorResponse(res, 'Invalid email format', 400)
        return
      }

      if (!helpers.validatePassword(password)) {
        helpers.errorResponse(
          res,
          'Password must be at least 8 characters',
          400
        )
        return
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        helpers.errorResponse(res, 'User already exists', 400)
        return
      }

      const hashedPassword = await helpers.hashPassword(password)
      const user = new User({ name, email, password: hashedPassword })
      await user.save()

      const token = helpers.generateToken({ id: user._id })
      const sanitizedUser = helpers.sanitizeUser(user)

      helpers.successResponse(
        res,
        {
          token,
          user: sanitizedUser
        },
        201
      )
    } catch (error) {
      helpers.errorResponse(res, 'Registration failed', 500, error)
    }
  }

  // User login
  public async login (req: Request, res: Response): Promise<void> {
   
    
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email }).select('+password')
      if (!user) {
        helpers.errorResponse(res, 'Invalid credentials', 401)
        return
      }

      const isMatch = await helpers.comparePasswords(password, user.password)
      if (!isMatch) {
        helpers.errorResponse(res, 'Invalid credentials', 401)
        return
      }

      const token = helpers.generateToken({ id: user._id, email: user.email })
      const sanitizedUser = helpers.sanitizeUser(user)

      helpers.successResponse(res, {
        token,
        user: sanitizedUser
      })
    } catch (error) {
      helpers.errorResponse(res, 'Login failed', 500, error)
    }
  }

  // Get current user profile
  public async getProfile (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log('dddddddddddddddddddddddddddddddddd', req)

      if (!req.user?.id) {
        helpers.errorResponse(res, 'Unauthorized', 401)
        return
      }

      const user = await User.findById(req.user.id)
      if (!user) {
        console.log('user not found')

        helpers.errorResponse(res, 'User not found', 404)
        return
      }

      const sanitizedUser = helpers.sanitizeUser(user)
      helpers.successResponse(res, sanitizedUser)
    } catch (error) {
      helpers.errorResponse(res, 'Failed to fetch profile', 500, error)
    }
  }

  // Update user profile
  public async updateProfile (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        helpers.errorResponse(res, 'Unauthorized', 401)
        return
      }

      const updates = helpers.pick(req.body, ['name', 'email'])
      const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true
      })

      if (!user) {
        helpers.errorResponse(res, 'User not found', 404)
        return
      }

      const sanitizedUser = helpers.sanitizeUser(user)
      helpers.successResponse(res, sanitizedUser)
    } catch (error) {
      helpers.errorResponse(res, 'Update failed', 500, error)
    }
  }

  // Change password
  public async changePassword (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      if (!req.user?.id) {
        helpers.errorResponse(res, 'Unauthorized', 401)
        return
      }

      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user.id).select('+password')

      if (!user) {
        helpers.errorResponse(res, 'User not found', 404)
        return
      }

      const isMatch = await helpers.comparePasswords(
        currentPassword,
        user.password
      )
      if (!isMatch) {
        helpers.errorResponse(res, 'Current password is incorrect', 401)
        return
      }

      user.password = await helpers.hashPassword(newPassword)
      await user.save()

      helpers.successResponse(res, { message: 'Password updated successfully' })
    } catch (error) {
      helpers.errorResponse(res, 'Password change failed', 500, error)
    }
  }

  // Logout user
  public async logout (req: Request, res: Response): Promise<void> {
    try {
      helpers.successResponse(res, { message: 'Logged out successfully' })
    } catch (error) {
      helpers.errorResponse(res, 'Logout failed', 500, error)
    }
  }
}

export default new AuthController()
