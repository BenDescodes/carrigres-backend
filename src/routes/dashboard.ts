import express from "express"
import { dashboard } from "../controllers/dashboard"

const router = express.Router()

router.get("/", dashboard)

export default router
