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
const {createApp, deleteApp, getAppData} = require("./handlers/Apps");


// organisation
app.post("/signUpOrganisation", signUpOrganisation);
app.post("/loginOrganisation", loginOrganisation);
app.post("/resetPassword", forgotPassword);
app.get("/organisationData", FBAuth, getAuthenticatedOrganisation);

app.post("/createApp", FBAuth, createApp);
app.post("/deleteApp/:appId", FBAuth, deleteApp);
app.post("/getAppData/:appId", FBAuth, getAppData);


exports.api = onRequest(app);
