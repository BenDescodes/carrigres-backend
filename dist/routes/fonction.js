"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fonction_1 = require("../controllers/fonction");
const router = express_1.default.Router();
router.get("/", fonction_1.fetchAllFonction);
exports.default = router;
