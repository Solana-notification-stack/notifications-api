const express = require("express");
const cors = require("cors");
const app = express();
const {setGlobalOptions} = require("firebase-functions/v2");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
require("dotenv").config();
const upload=require('./fileStorage')

setGlobalOptions({maxInstances: 10});
app.use(cors());
const {onRequest} = require("firebase-functions/v2/https");
const {db} = require("./utils/admin");
const {signUpOrganisation, loginOrganisation, getAuthenticatedOrganisation, forgotPassword} = require("./handlers/Organisations");
const FBAuth = require("./utils/FBAuth");
const AppAuth = require("./utils/AppAuth");
const {createApp, deleteApp, getAppData} = require("./handlers/Apps");
const { registerUserAsSubscriber } = require("./handlers/Users");
const { sendNotificationToAll } = require("./handlers/Notifications");


// organisationh
app.post("/signUpOrganisation", signUpOrganisation);
app.post("/loginOrganisation", loginOrganisation);
app.post("/resetPassword", forgotPassword);
app.get("/organisationData", FBAuth, getAuthenticatedOrganisation);

//app
app.post("/createApp", FBAuth,upload.single('file'), createApp);
app.post("/deleteApp/:appId", FBAuth, deleteApp);
app.get("/getAppData/:appId", FBAuth, getAppData);


//users
app.post("/subscribeUser",AppAuth,registerUserAsSubscriber)


//notifications
app.post("/appSendNotification",AppAuth,sendNotificationToAll)


exports.api = onRequest(app);
