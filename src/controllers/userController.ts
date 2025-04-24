import { Request, Response } from 'express'
import User, { IUser } from '../models/userModel.js'
import bcrypt from 'bcryptjs'

interface ErrorResponse {
  message: string
  error?: string
}

class UserController {
  private static createErrorResponse (
    message: string,
    error: unknown
  ): ErrorResponse {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return { message, error: errorMessage }
  }

 

  public async getUsers (req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find()
      res.status(200).json(users)
    } catch (error: unknown) {
      const response = UserController.createErrorResponse(
        'Error fetching users',
        error
      )
      res.status(500).json(response)
    }
  }

  public async getUserById (req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.params.id)

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.status(200).json(user)
    } catch (error: unknown) {
      const response = UserController.createErrorResponse(
        'Error fetching user',
        error
      )
      res.status(500).json(response)
    }
  }

  public async updateUser (req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body as Pick<IUser, 'name' | 'email'>

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email },
        { new: true, runValidators: true }
      )

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.status(200).json(user)
    } catch (error: unknown) {
      const response = UserController.createErrorResponse(
        'Error updating user',
        error
      )
      res.status(500).json(response)
    }
  }

  public async deleteUser (req: Request, res: Response): Promise<void> {
    try {
      const user = await User.findByIdAndDelete(req.params.id)

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }

      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error: unknown) {
      const response = UserController.createErrorResponse(
        'Error deleting user',
        error
      )
      res.status(500).json(response)
    }
  }
}

export default new UserController()
