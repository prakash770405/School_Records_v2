const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "School_Database_Refresh",
        transformation: [
            {
                width: 262,
                height: 175,
                crop: "fill",        // fixed crop
                gravity: "auto"      // smart center crop
            }
        ],
        allowed_formats: ["jpg", "png", "jpeg"]

    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
});

module.exports = upload;


