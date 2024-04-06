const express = require("express");
const cors = require("cors");
const app = express();
const {setGlobalOptions} = require("firebase-functions/v2");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
require("dotenv").config();


setGlobalOptions({maxInstances: 10});
app.use(cors());
const {onRequest} = require("firebase-functions/v2/https");
const {db} = require("./utils/admin");
const {signUpOrganisation, loginOrganisation, getAuthenticatedOrganisation, forgotPassword} = require("./handlers/Organisations");
const FBAuth = require("./utils/FBAuth");
const AppAuth = require("./utils/AppAuth");
const {createApp, deleteApp, getAppData} = require("./handlers/Apps");
const { registerUserAsSubscriber } = require("./handlers/Users");
const { sendNotificationToGroup, setNotificationForAccountChange, subscribeAccountChangeNotifForOne, sendNotificationToOneUser } = require("./handlers/Notifications");
const { createCampaign, deleteCampaign, joinCampaign, removeUserFromCampaign } = require("./handlers/Campaigns");




// organisationh
app.post("/signUpOrganisation", signUpOrganisation);
app.post("/loginOrganisation", loginOrganisation);
app.post("/resetPassword", forgotPassword);
app.get("/organisationData", FBAuth, getAuthenticatedOrganisation);

//app
app.post("/createApp", FBAuth, createApp);
app.post("/deleteApp/:appId", FBAuth, deleteApp);
app.get("/getAppData/:appId", FBAuth, getAppData);


//users
app.post("/subscribeUser",AppAuth,registerUserAsSubscriber)


//notifications
app.post("/appSendNotificationToGroup",AppAuth,sendNotificationToGroup)
app.post("/appSendNotificationToOneUser",AppAuth,sendNotificationToOneUser)
app.post("/app/setAccountChangeNotification",AppAuth,setNotificationForAccountChange)
app.post("/app/subscibeOneForAccountChange",AppAuth,subscribeAccountChangeNotifForOne)

//campaigns
app.post("/appCreateCampaign",AppAuth,createCampaign)
app.post("/appDeleteCampaign/:campaignId",AppAuth,deleteCampaign)
app.post("/appJoinCampaign/:campaignId",AppAuth,joinCampaign)
app.post("/appUnsubscribeCampaign/:campaignId",AppAuth,removeUserFromCampaign)

exports.api = onRequest(app);
