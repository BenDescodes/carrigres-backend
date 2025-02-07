import express from "express"
import { suggestion } from "../controllers/contact"
const router = express.Router()

router.post("/", suggestion)

export default router
