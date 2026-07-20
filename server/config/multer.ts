import multer from "multer";
import ErrorHandler from "../utils/ErrorHandler";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (
    req,
    file,
    cb
) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new ErrorHandler(
                "Only JPG, PNG and WEBP images are allowed",
                400
            )
        );
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter,
});