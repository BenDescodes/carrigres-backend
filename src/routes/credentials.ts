import express from "express"
import { auth } from "../middleware/user"
import { fetchAllRole, fetchAllUsers, fetchOneUsers, login, signup, updateUser } from "../controllers/credentials"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.get("/roles", fetchAllRole)
router.get("/users", fetchAllUsers)
router.get("/users/:id", fetchOneUsers)
router.put("/users/:id", updateUser)
/* route.get('/', auth, findUser) */

export default router
