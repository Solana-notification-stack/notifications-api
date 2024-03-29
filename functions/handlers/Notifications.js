// const { db} = require("../utils/admin");
// const admin = require("firebase-admin");

// // Initialize Firebase Admin SDK instances
// const initializedApps = {};

// // Initialize Firebase Admin SDK for a given app ID
// function initializeFirebaseAdmin(json, appId) {
//   if (!initializedApps[appId]) {
  
//     const firebaseApp = admin.initializeApp({
//       credential: admin.credential.cert(json),
//     }, `App-${appId}`);
//     initializedApps[appId] = firebaseApp;
//   }
// }
// exports.sendNotificationToAll =(req, res) => {

//     const notificationBody = req.body.notificationBody;
//     const notificationTitle = req.body.notificationTitle;
//     const notificationImage = req.body.notificationImage
//     const appId = req.app.appId;
    
//     let tokens = [];
// const service_account = fetch("https://firebasestorage.googleapis.com/v0/b/solana-notifications.appspot.com/o/rn-notification-bada3-firebase-adminsdk-kpy5m-eb4c7b91d9.json?alt=media&token=9be50933-e9d6-4dbe-9434-0510d96ab6aa")
    
//     db.collection("apps").doc(appId).get()
//     .then(appSnapshot => {
//         if (!appSnapshot.exists) {
//             throw new Error("App not found");
//         }
//         const appData = appSnapshot.data();
//         const userIds = appData.userIds || [];
//         return userIds;
//     })
//     .then(userIds => {
//         const usersPromises = userIds.map(userId => {
//             return db.collection("users").doc(userId).get()
//                 .then(userDoc => userDoc.data())
//                 .catch(err => {
//                     console.error(err);
//                     return null;
//                 });
//         });
//         return Promise.all(usersPromises);
//     })
//     .then(usersData => {
//         usersData.forEach(user => {
//             if (user && user.notificationToken) {
//                 tokens.push(user.notificationToken);
//             }
//         });
//         console.log(tokens);
//         const message = {
//             tokens: tokens,
//             notification: {
//               body: notificationBody,
//               title: notificationTitle,
//             },
//             apns: {
//               payload: {
//                 aps: {
//                   'mutable-content': 1,
//                 },
//               },
//               fcmOptions: {
//                 imageUrl: notificationImage,
//               },
//             },
//             android: {
//               notification: {
//                 imageUrl: notificationImage,
//               },
//             },
//           };


//         initializeFirebaseAdmin(service_account, appId);

       
//         return initializedApps[appId].messaging().sendEachForMulticast(message);
//     })
//     .then(response => {
//         console.log("Successfully sent notifications:", response.responses[0].error);
//         res.status(200).json({ message: "Successfully sent notifications" });
//     })
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({ error: "Failed to send notifications", details: err.message });
//     });
// };


const { db } = require("../utils/admin");
const admin = require("firebase-admin");


// Initialize Firebase Admin SDK instances
const initializedApps = {};

// Initialize Firebase Admin SDK for a given app ID
function initializeFirebaseAdmin(json, appId) {
  if (!initializedApps[appId]) {
    const firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(json),
    }, `App-${appId}`);
    initializedApps[appId] = firebaseApp;
  }
}

exports.sendNotificationToAll = async (req, res) => {
  try {
    const notificationBody = req.body.notificationBody;
    const notificationTitle = req.body.notificationTitle;
    const notificationImage = req.body.notificationImage;
    const appId = req.app.appId;
    let service_account_url;

    let tokens = [];



    const appSnapshot = await db.collection("apps").doc(appId).get();
    if (!appSnapshot.exists) {
      throw new Error("App not found");
    }
    const appData = appSnapshot.data();
    service_account_url = appData.service_account
    const userIds = appData.userIds || [];

    const usersData = await Promise.all(userIds.map(userId => {
      return db.collection("users").doc(userId).get()
      .then(userDoc => userDoc.data())
      .catch(err => {
        console.error(err);
        return null;
      });
  }));

  usersData.forEach(user => {
    if (user && user.notificationToken) {
      tokens.push(user.notificationToken);
    }
  });
  console.log(tokens);

  const message = {
    tokens: tokens,
    notification: {
      body: notificationBody,
      title: notificationTitle,
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcmOptions: {
        imageUrl: notificationImage,
      },
    },
    android: {
      notification: {
        imageUrl: notificationImage,
      },
    },
  };
  const service_account_response = await fetch(service_account_url);
  const service_account = await service_account_response.json();
  initializeFirebaseAdmin(service_account, appId);

  const response = await initializedApps[appId].messaging().sendMulticast(message);

  console.log("Successfully sent notifications:", response.responses[0].error);
  res.status(200).json({ message: "Successfully sent notifications" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: "Failed to send notifications", details: err.message });
}
};

