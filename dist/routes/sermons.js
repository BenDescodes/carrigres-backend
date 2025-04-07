"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sermons_1 = require("../controllers/sermons");
const multerConfig_1 = require("../middleware/multerConfig");
const uploadFiles = multerConfig_1.upload.fields([{ name: "imageSermon", maxCount: 1 }]);
const router = express_1.default.Router();
router.get("/pasteurs", sermons_1.fetchAllSermonPasteur);
router.get("/", sermons_1.fetchAllSermon);
router.get("/:id", sermons_1.fetchOneSermon);
router.post("/", uploadFiles, sermons_1.createSermon);
router.put("/:id", sermons_1.updateSermon);
router.delete("/:id", sermons_1.deleteSermon);
exports.default = router;
