"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const credentials_1 = require("../controllers/credentials");
const router = express_1.default.Router();
router.post("/signup", credentials_1.signup);
router.post("/login", credentials_1.login);
router.get("/roles", credentials_1.fetchAllRole);
router.get("/users", credentials_1.fetchAllUsers);
router.get("/users/:id", credentials_1.fetchOneUsers);
router.put("/users/:id", credentials_1.updateUser);
router.delete("/users/:id", credentials_1.deleteUser);
/* route.get('/', auth, findUser) */
exports.default = router;
