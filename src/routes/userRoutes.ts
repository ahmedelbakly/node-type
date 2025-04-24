import express, { Router } from 'express'
import UserController from '../controllers/userController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router: Router = express.Router()

// Get all users
router.get('/', authMiddleware.verifyToken, UserController.getUsers)

// Get a single user by ID with authentication
router.get('/:id', authMiddleware.verifyToken, UserController.getUserById)

// Update a user
router.put('/:id', authMiddleware.verifyToken, UserController.updateUser)

// Delete a user
router.delete('/:id', authMiddleware.verifyToken, UserController.deleteUser)

export default router
