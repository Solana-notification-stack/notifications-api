const multer = require('multer');
const path = require("path");
const os = require("os");

    // Set up Multer storage for file uploads
const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, os.tmpdir()); // Temporary directory for storing uploaded files
        },
        filename: (req, file, cb) => {
          const fileExtension = path.extname(file.originalname);
          const fileName = `${Math.round(Math.random() * 1000000000000).toString()}.${fileExtension}`;
          cb(null, fileName);
        }
      });
  
module.exports = multer({ storage: storage })