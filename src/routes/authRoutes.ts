import express from 'express'
import authController from '../controllers/authController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.get('/profile', authMiddleware.verifyToken, authController.getProfile)
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile)
router.put(
  '/password',
  authMiddleware.verifyToken,
  authController.changePassword
)
router.put('/logout', authMiddleware.verifyToken, authController.logout)

export default router
