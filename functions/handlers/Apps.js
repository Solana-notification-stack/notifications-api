const {db, admin} = require("../utils/admin");
const crypto = require("crypto");

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

exports.createApp = (req, response) => {
  const orgId = req.user.orgId;
  const appId = generateUniqueAppId(req.body.appName);
  const appSecret = generateAppSecretKey(appId, req.body.appName);

  const appDetails = {
    orgId,
    appName: req.body.appName,
    appId,
    appSecret,
    userIds: [],
  };

  db.collection("apps").doc(appId).set(appDetails)
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
        response.status(200).json({message: "Created App successfully."});
      })
      .catch((err) => {
        console.error(err);
        if (err.message) {
          response.status(400).json({error: err.message});
        } else {
          response.status(500).json({error: "Something went wrong while creating the App."});
        }
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
  const AppData = {};
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
