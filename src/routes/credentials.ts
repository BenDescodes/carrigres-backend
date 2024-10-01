import express from 'express'
import { auth } from '../middleware/user'
import { login, signup } from '../controllers/credentials'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
/* route.get('/', auth, findUser) */

export default router