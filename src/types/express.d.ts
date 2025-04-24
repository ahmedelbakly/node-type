import { Document } from 'mongoose'
import { IUser } from '../models/userModel'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        role?: string
      } & Partial<Document>
    }
  }
}
