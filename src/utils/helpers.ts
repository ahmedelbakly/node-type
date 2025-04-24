import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { Document } from 'mongoose'

export class Helpers {
  private static instance: Helpers
  private jwtSecret: string

  private constructor () {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
  }

  public static getInstance (): Helpers {
    if (!Helpers.instance) {
      Helpers.instance = new Helpers()
    }
    return Helpers.instance
  }

  // Error Handling
  public createErrorResponse (
    message: string,
    error: unknown
  ): { message: string; error?: string } {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return { message, error: errorMessage }
  }

  // Password Hashing
  public async hashPassword (password: string): Promise<string> {
    const saltRounds = 10
    return await bcrypt.hash(password, saltRounds)
  }

  public async comparePasswords (
    plainText: string,
    hashed: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainText, hashed)
  }

  public generateToken (
    payload: string | object | Buffer,
    expiresIn: string | number = '1h'
  ): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn } as jwt.SignOptions)
  }

  public verifyToken (token: string): any {
    return jwt.verify(token, this.jwtSecret)
  }

  // Response Formatting
  public successResponse (
    res: Response,
    data: any,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data
    })
  }

  public errorResponse (
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: any
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error?.message || error
    })
  }

  // Data Sanitization
  public sanitizeUser<T extends Document> (user: T): Omit<T, 'password'> {
    const userObj = user.toObject()
    delete userObj.password
    return userObj
  }

  public pick<T extends object, K extends keyof T> (
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    return keys.reduce((acc, key) => {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        acc[key] = obj[key]
      }
      return acc
    }, {} as Pick<T, K>)
  }

  // Validation
  public validateEmail (email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  public validatePassword (password: string): boolean {
    return password.length >= 8
  }

  // Pagination
  public paginate<T> (
    data: T[],
    page: number,
    limit: number
  ): { data: T[]; meta: { page: number; limit: number; total: number } } {
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = data.length

    return {
      data: data.slice(startIndex, endIndex),
      meta: {
        page,
        limit,
        total
      }
    }
  }
}

// Singleton instance
const helpers = Helpers.getInstance()
export default helpers
