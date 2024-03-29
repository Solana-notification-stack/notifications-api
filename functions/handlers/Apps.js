const {db, admin} = require("../utils/admin");
const crypto = require("crypto");
const { uuid } = require("uuidv4");


function generateUniqueAppId(name) {
  const truncatedName = name.slice(0, 5);
  const randomString = Math.random().toString(36).substring(2, 7);
  const appId = `App-${truncatedName.toUpperCase()}-${randomString.toUpperCase()}`;
  return appId;
}

function generateAppSecretKey(appId, appName) {
  const data = `${appName}-${appId}`;
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return hash.substring(0, 32);
} 

// exports.createApp = (req, response) => {
//   const Busboy = require("busboy");
//     const path = require("path");
//     const os = require("os");
//     const fs = require("fs");
//   const orgId = req.user.orgId;
//   const appId = generateUniqueAppId(req.body.appName);
//   const appSecret = generateAppSecretKey(appId, req.body.appName);
// let service_account;



// const busboy = Busboy({ headers: req.headers });

// let jsonfileToBeUploaded = {};
// let jsonfileName;
// let generatedToken = uuid();

// busboy.on("file", (fieldname, file, filename) => {
//   let mimetype = filename.mimeType;

//   const fileExtension =
//     filename.filename.split(".")[filename.filename.split(".").length - 1];
//   // 32756238461724837.png
//   jsonfileName = `${Math.round(
//     Math.random() * 1000000000000
//   ).toString()}.${fileExtension}`;
//   const filepath = path.join(os.tmpdir(), jsonfileName);
//   jsonfileToBeUploaded = { filepath, mimetype };
//   file.pipe(fs.createWriteStream(filepath));
// });
// busboy.on("finish", () => {
//   admin
//     .storage()
//     .bucket()
//     .upload(jsonfileToBeUploaded.filepath, {
//       resumable: false,
//       metadata: {
//         metadata: {
//           contentType: "application/json",
//           firebaseStorageDownloadTokens: generatedToken,
//         },
//       },
//     })
//     .then(() => {
//     service_account = `https://firebasestorage.googleapis.com/v0/b/solana-notifications.appspot.com/o${jsonfileName}?alt=media&token=${generatedToken}`;



//   const appDetails = {
//     orgId,
//     appName: req.body.appName,
//     appId,
//     appSecret,
//     userIds: [],
//     service_account
//   };

//   return db.collection("apps").doc(appId).set(appDetails)})
//       .then(() => {
//         return db.doc(`/organisations/${orgId}`).get();
//       })
//       .then((orgDoc) => {
//         const data = orgDoc.data();
//         const registeredAppIds = data.registeredAppIds || [];
//         registeredAppIds.push(appId);
//         return db.doc(`/organisations/${orgId}`).update({
//           registeredAppIds: registeredAppIds,
//         });
//       })
//       .then(() => {
//         response.status(200).json({message: "Created App successfully."});
//       })
//       .catch((err) => {
//         console.error(err);
//         if (err.message) {
//           response.status(400).json({error: err.message});
//         } else {
//           response.status(500).json({error: "Something went wrong while creating the App."});
//         }
//       });
// })
// busboy.end(req.rawBody);}
const multer = require('multer');
const path = require("path");
const os = require("os");
const fs = require("fs");

// Configure multer to handle only non-file fields
const upload = multer().none();

exports.createApp = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'Error uploading file' });
    }

    // Access the non-file fields including 'appName'
    const { appName } = req.body;
    if (!appName) {
      return res.status(400).json({ error: 'Missing appName field' });
    }

    // Further processing of the API request
    const orgId = req.user.orgId;
    const appId = generateUniqueAppId(appName);
    const appSecret = generateAppSecretKey(appId, appName);
    let service_account;

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

    const upload = multer({ storage: storage }).single('file');

    upload(req, res, (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'Error uploading file' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload file to storage bucket
      const generatedToken = uuid();
      const fileExtension = path.extname(req.file.originalname);
      const jsonfileName = `${Math.round(Math.random() * 1000000000000).toString()}.${fileExtension}`;
      const fileData = fs.readFileSync(req.file.path);

      admin.storage().bucket()
        .file(jsonfileName)
        .save(fileData, {
          resumable: false,
          metadata: {
            contentType: 'application/json',
            metadata: {
              firebaseStorageDownloadTokens: generatedToken
            }
          }
        })
        .then(() => {
          service_account = `https://firebasestorage.googleapis.com/v0/b/solana-notifications.appspot.com/o/${jsonfileName}?alt=media&token=${generatedToken}`;

          const appDetails = {
            orgId,
            appName,
            appId,
            appSecret,
            userIds: [],
            service_account
          };

          // Save app details to database
          return db.collection("apps").doc(appId).set(appDetails);
        })
        .then(() => {
          return db.doc(`/organisations/${orgId}`).get();
        })
        .then((orgDoc) => {
          const data = orgDoc.data();
          const registeredAppIds = data.registeredAppIds || [];
          registeredAppIds.push(appId);
          return db.doc(`/organisations/${orgId}`).update({
            registeredAppIds: registeredAppIds,
          });
        })
        .then(() => {
          res.status(200).json({ message: "Created App successfully." });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: "Something went wrong while creating the App." });
        });
    });
  });
};


exports.deleteApp = (request, response) => {
  const appId = request.params.appId;
  db.collection("apps").doc(appId).delete()
      .then(() => {
        response.json({message: `App deleted successfully`});
      })
      .catch((err) => {
        console.error(err);
        response.status(500).json({error: "Something went wrong while deleting the App."});
      });
};

exports.getAppData = (request, response) => {
  let AppData;
  db.doc(`/apps/${request.params.appId}`).get()
      .then((doc) => {
        if (!doc.exists) {
          return response.status(404).json({error: "App not found"});
        }
        AppData = doc.data();
        return doc.data().userIds;
      })
      .then((data) => {
        const promises = data.map((userId) => {
          return db.collection("users").doc(userId).get()
              .then((userDoc) => userDoc.data())
              .catch((err) => {
                console.error(err);
                return null;
              });
        });
        return Promise.all(promises);
      })
      .then((usersData) => {
        AppData.usersData = usersData.filter((user) => user !== null);
        return response.json(AppData);
      })
      .catch((err) => {
        console.error(err);
        response.status(500).json({error: err.message || "Something went wrong while fetching the App data."});
      });
};


// exports.purchasePass = (req, res) => {
//   try {
//     const Busboy = require("busboy");
//     const path = require("path");
//     const os = require("os");
//     const fs = require("fs");
//     const passId = req.params.passId;
//     const blitzId = req.user.blitzId;
//     let imageUrl;

//     const busboy = Busboy({ headers: req.headers });

//     let imageToBeUploaded = {};
//     let imageFileName;
//     // String for image token
//     let generatedToken = uuid();

//     busboy.on("file", (fieldname, file, filename) => {
//       let mimetype = filename.mimeType;

//       //   if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
//       //     console.log("---------------errr--------------")
//       //     return res.status(400).json({ error: "Wrong file type submitted" });
//       //   }
//       // my.image.png => ['my', 'image', 'png']
//       const imageExtension =
//         filename.filename.split(".")[filename.filename.split(".").length - 1];
//       // 32756238461724837.png
//       imageFileName = `${Math.round(
//         Math.random() * 1000000000000
//       ).toString()}.${imageExtension}`;
//       const filepath = path.join(os.tmpdir(), imageFileName);
//       imageToBeUploaded = { filepath, mimetype };
//       file.pipe(fs.createWriteStream(filepath));
//     });
//     busboy.on("finish", () => {
//       admin
//         .storage()
//         .bucket()
//         .upload(imageToBeUploaded.filepath, {
//           resumable: false,
//           metadata: {
//             metadata: {
//               contentType: imageToBeUploaded.mimetype,
//               //Generate token to be appended to imageUrl
//               firebaseStorageDownloadTokens: generatedToken,
//             },
//           },
//         })
//         .then(() => {
//           imageUrl = `https://firebasestorage.googleapis.com/v0/b/blitzstarter-d367e.appspot.com/o/${imageFileName}?alt=media&token=${generatedToken}`;

//           return db.collection(`/pasess`).add({
//             passId,
//             blitzId,
//             imageUrl,
//             status: "unVerified",
//           });
//         })
//         .then(() => {
//           return db.doc(`/users/${blitzId}`).get();
//         })
//         .then((d) => {
//           const data = d.data();
//           let passes = data.passes || [];
//           passes.push({ passId, status: "unVerified" });
//           return db.doc(`/users/${blitzId}`).update({ passes });
//         })
//         .then(() => {
//           return res.json({ message: "image uploaded successfully" });
//         })
//         .catch((err) => {
//           console.error(err);
//           return res.status(500).json({ error: "something went wrong" });
//         });
//     });
//     busboy.end(req.rawBody);
//   } catch (err) {
//     console.log(err);
//   }
// };