const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "others";
    let resource_type = "auto";
    let allowed_formats = [];

    if (file.fieldname === "images") {
      folder = "images";
      resource_type = "image";
      allowed_formats = ["jpeg", "png", "jpg", "webp"];
    } else if (file.fieldname === "videos") {
      folder = "videos";
      resource_type = "video";
      allowed_formats = ["mp4", "mov", "avi", "mkv"];
    }

    return {
      folder,
      resource_type,
      allowed_formats,
    };
  },
});

const upload = multer({ storage });

module.exports = { upload };
