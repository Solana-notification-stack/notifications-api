const express = require("express")
const cors = require("cors")
const app = express()
const {setGlobalOptions} = require("firebase-functions/v2");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer")

require("dotenv").config()

setGlobalOptions({maxInstances: 10});
app.use(cors());
const {onRequest} = require("firebase-functions/v2/https");
const { db } = require("./util/admin");