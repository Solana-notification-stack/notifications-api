const multer = require('multer');
const path = require("path");
const os = require("os");
const fs = require("fs");

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

  const upload = multer({ storage: storage });

  module.exports=upload