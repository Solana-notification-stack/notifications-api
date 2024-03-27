const { db, admin } = require("../utils/admin");

exports.sendNotificationToAll = (req, res) => {
    const notificationBody = req.body.notificationBody;
    const notificationTitle = req.body.notificationTitle;
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
        const payload = {
            notification: {
                title: notificationTitle,
                body: notificationBody
            },
            tokens
        };
        return admin.messaging().sendMulticast(payload);
    })
    .then(response => {
        console.log("Successfully sent notifications:", response);
        res.status(200).json({ message: "Successfully sent notifications" });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: "Failed to send notifications", details: err.message });
    });
};
