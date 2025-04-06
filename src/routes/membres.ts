import express from "express"
import {
    activeMembre,
    celibataireMembre,
    checkMembre,
    checkOneMembre,
    createMembre,
    deleteMembre,
    fetchAllMembre,
    fetchOneMembre,
    parentMembre,
    createActiveMembre,
    updateMembre,
    updateProfilMembre,
} from "../controllers/membres"

import { upload } from "../middleware/multerConfig"

const uploadFiles = upload.fields([{ name: "profil", maxCount: 1 }])

const router = express.Router()

router.get("/activeMembres", activeMembre)
router.post("/activeMembres", createActiveMembre)
router.get("/", fetchAllMembre)
router.get("/:id", fetchOneMembre)
router.post("/", uploadFiles, createMembre)
router.put("/:id", updateMembre)
router.put("/profil/:id", uploadFiles, updateProfilMembre)
router.delete("/:id", deleteMembre)
router.get("/parent/:sexe", parentMembre)
router.get("/celibataire/:sexe", celibataireMembre)
router.post("/checkMembres", checkMembre)
router.get("/checkMembres/:tkMembre", checkOneMembre)

export default router
