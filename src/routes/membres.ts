import express from "express"
import {
    celibataireMembre,
    createMembre,
    deleteMembre,
    fetchAllMembre,
    fetchOneMembre,
    parentMembre,
    updateMembre,
} from "../controllers/membres"

import { upload } from "../middleware/multerConfig"

const uploadFiles = upload.fields([{ name: "profil", maxCount: 1 }])

const router = express.Router()

router.get("/", fetchAllMembre)
router.get("/:id", fetchOneMembre)
router.post("/", uploadFiles, createMembre)
router.put("/:id", updateMembre)
router.delete("/:id", deleteMembre)
router.get("/parent/:sexe", parentMembre)
router.get("/celibataire/:sexe", celibataireMembre)

export default router
