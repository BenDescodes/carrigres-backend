import express from "express";
import { createMembre, deleteMembre, fetchAllMembre, fetchOneMembre, updateMembre } from "../controllers/membres";
import { upload } from '../middleware/multerConfig'

const uploadFiles = upload.fields([{ name: 'profil', maxCount: 1 }]);

/* const uploadFiles = upload.single('profil') */

const router = express.Router()

router.get('/', fetchAllMembre)
router.get('/:id', fetchOneMembre)
router.post('/', uploadFiles, createMembre)
router.put('/:id', uploadFiles, updateMembre)
router.delete('/:id', deleteMembre)


export default router;