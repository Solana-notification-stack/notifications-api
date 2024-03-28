const { db} = require("../utils/admin");
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
exports.sendNotificationToAll = (req, res) => {

    const notificationBody = req.body.notificationBody;
    const notificationTitle = req.body.notificationTitle;
    const notificationImage = req.body.notificationImage
    const appId = req.app.appId;
    
    let tokens = [];
    
    db.collection("apps").doc(appId).get()
    .then(appSnapshot => {
        if (!appSnapshot.exists) {
            throw new Error("App not found");
        }
        const appData = appSnapshot.data();
        const userIds = appData.userIds || [];
        return userIds;
    })
    .then(userIds => {
        const usersPromises = userIds.map(userId => {
            return db.collection("users").doc(userId).get()
                .then(userDoc => userDoc.data())
                .catch(err => {
                    console.error(err);
                    return null;
                });
        });
        return Promise.all(usersPromises);
    })
    .then(usersData => {
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
        const service_account = {

          } 

        initializeFirebaseAdmin(service_account, appId);

       
        return initializedApps[appId].messaging().sendEachForMulticast(message);
    })
    .then(response => {
        console.log("Successfully sent notifications:", response.responses[0].error);
        res.status(200).json({ message: "Successfully sent notifications" });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Failed to send notifications", details: err.message });
    });
};
