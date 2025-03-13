"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = require("./routes");
const path_1 = __importDefault(require("path"));
//App Varaibles
dotenv.config();
//intializing the express app
const app = (0, express_1.default)();
//using the dependancies
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/src/images", express_1.default.static(path_1.default.join(__dirname, "images")));
/* app.use(bodyParser.urlencoded({ extended: false })) */
// // parse application/json
// app.use(bodyParser.json())
app.use("/api/membres", routes_1.MembresRouter);
app.use("/api/sermons", routes_1.SermonRouter);
app.use("/api/predicateurs", routes_1.PredRouter);
app.use("/api/credentials", routes_1.credentials);
app.use("/api/fonctions", routes_1.fonctionRouter);
app.use("/api/dashboard", routes_1.dashboardRouter);
app.use("/api/contact", routes_1.contactRouter);
app.use("/api/contact", routes_1.contactRouter);
//exporting app
module.exports = app;
