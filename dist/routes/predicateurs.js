"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const predicateurs_1 = require("../controllers/predicateurs");
const router = express_1.default.Router();
router.get('/', predicateurs_1.fetchAllPred);
router.get('/:id', predicateurs_1.fetchOnePred);
router.post('/', predicateurs_1.createPred);
router.put('/:id', predicateurs_1.updatePred);
router.delete('/:id', predicateurs_1.deletePred);
exports.default = router;
