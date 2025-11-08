"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.fileCompresse = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const fileCompresse = (extension, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (extension == ".png") {
        yield (0, sharp_1.default)(file.path)
            .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
            .withMetadata()
            .toFile("./src/images/" + file.filename, (err, info) => {
            if (err)
                console.log(err);
            else
                console.log("Upload reussi");
        });
    }
    else {
        yield (0, sharp_1.default)(file.path)
            .toFormat("jpg")
            .jpeg({ quality: 80 })
            .toFile("./src/images/" + file.filename, (err, info) => {
            if (err)
                console.log(err);
            else
                console.log("Upload reussi");
        });
    }
});
exports.fileCompresse = fileCompresse;
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};
const storage = multer_1.default.diskStorage({
    /* destination: (req, file, callback) => { callback(null, "src\\images"); }, */
    filename: (req, file, callback) => {
        if (file.mimetype.startsWith("image")) {
            const extension = MIME_TYPES[file.mimetype];
            callback(null, Date.now() + "." + extension);
        }
        else {
            callback(new Error("Upload une image"), "");
        }
    },
});
exports.upload = (0, multer_1.default)({ storage });
