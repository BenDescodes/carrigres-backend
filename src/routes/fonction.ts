import express from "express"
import { fetchAllFonction } from "../controllers/fonction"

const router = express.Router()

router.get("/", fetchAllFonction)

export default router
