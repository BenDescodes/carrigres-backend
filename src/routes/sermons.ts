import express from "express";
import { createSermon, deleteSermon, fetchAllSermon, fetchOneSermon, updateSermon } from "../controllers/sermons";
import { upload } from '../middleware/multerConfig'

const uploadFiles = upload.fields([{ name: 'imageSermon', maxCount: 1 }]);
const router = express.Router()

router.get('/', fetchAllSermon)
router.get('/:id', fetchOneSermon)
router.post('/', uploadFiles, createSermon)
router.put('/:id', updateSermon)
router.delete('/:id', deleteSermon)

export default router