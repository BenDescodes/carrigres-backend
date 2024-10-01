import express from "express";
import { createPred, deletePred, fetchAllPred, fetchOnePred, updatePred } from "../controllers/predicateurs";

const router = express.Router()

router.get('/',fetchAllPred)
router.get('/:id',fetchOnePred)
router.post('/',createPred)
router.put('/:id',updatePred)
router.delete('/:id',deletePred)

export default router;