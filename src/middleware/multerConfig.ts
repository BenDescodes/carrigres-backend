import multer from "multer";
import sharp from "sharp";

export const fileCompresse = async (extension: string, file: any) => {
    if (extension == '.png') {
        await sharp(file.path)
            .png({ compressionLevel: 9, adaptiveFiltering: true, force: true }).withMetadata()
            .toFile("./src/images/" + file.filename, (err, info) => {
                if (err) console.log(err)
                else console.log('Upload reussi')
            })
    }
    else {
        await sharp(file.path)
            .toFormat("jpg")
            .jpeg({ quality: 80 })
            .toFile("./src/images/" + file.filename, (err, info) => {
                if (err) console.log(err)
                else console.log('Upload reussi')
            })
    }
}
const MIME_TYPES: any = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

const storage = multer.diskStorage({
    /* destination: (req, file, callback) => { callback(null, "src\\images"); }, */
    filename: (req, file, callback) => {
        console.log(req, file)
        if (file.mimetype.startsWith('image')) {
            const extension: Array = MIME_TYPES[file.mimetype];
            callback(null, Date.now() + '.' + extension);
        } else {
            callback("Upload une image", false)
        }
    }
});

export const upload = multer({ storage })