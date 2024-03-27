
const {admin, db} = require("../utils/admin");

const config = require("../utils/config");
const {initializeApp} = require("firebase/app");
const {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail} = require("firebase/auth");
const firebaseApp=initializeApp(config);
const auth = getAuth(firebaseApp);


function generateUniqueOrganisationId(name) {
  // Ensure the name is at least 5 characters long
  const truncatedName = name.slice(0, 5);
  // Generate a random 5-character string
  const randomString = Math.random().toString(36).substring(2, 7);

  // Combine the "BLITZ" prefix, truncated name, and random string
  const orgId = `Org-${truncatedName.toUpperCase()}-${randomString.toUpperCase()}`;

  return orgId;
}


const {
  validateSignupData,
  validateLoginData,
  validateEmail,
} = require("../utils/Validators");

exports.signUpOrganisation = (req, res) => {
  const newOrganisation = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    orgName: req.body.name,
  };
  const orgId = generateUniqueOrganisationId(req.body.name);
  const {valid, errors} = validateSignupData(newOrganisation);

  if (!valid) return res.status(400).json(errors);


  let token; let orgAuthId;
  createUserWithEmailAndPassword(auth, newOrganisation.email, newOrganisation.password).then((data) => {
    orgAuthId = data.user.uid;

    return data.user.getIdToken();
  })
      .then((idToken) => {
        token = idToken;
        const orgCredentials = {

          email: newOrganisation.email,
          orgName: newOrganisation.orgName,
          registeredAppIds: [],
          createdAt: new Date().toISOString(),
          orgAuthId,
          orgId,
        };
        return db.doc(`/organisations/${orgId}`).set(orgCredentials);
      })
      .then(() => {
        return res.status(201).json({token});
      })
      .catch((err) => {
        // console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return res.status(400).json({email: "Email is already is use"});
        } else {
          return res
              .status(500)
              .json({general: "Something went wrong, please try again"});
        }
      });
};

exports.loginOrganisation = (req, res) => {
  const org = {
    email: req.body.email,
    password: req.body.password,
  };

  const {valid, errors} = validateLoginData(org);

  if (!valid) return res.status(400).json(errors);


  signInWithEmailAndPassword(auth, org.email, org.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return res.json({token});
      })
      .catch((err) => {
        // console.error(err);
        // auth/wrong-password
        // auth/user-not-user
        return res
            .status(403)
            .json({general: "Wrong credentials, please try again"});
      });
};


exports.getAuthenticatedOrganisation = (req, res) => {
  const orgData = {};

  db.doc(`/organisations/${req.user.orgId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          orgData.credentials = doc.data();
          const orgApps = doc.data().registeredAppIds;

          // Check if user has registered events
          if (!orgApps || orgApps.length === 0) {
            // If not, send response with an empty array for registeredEventsData and registeredTeamsData
            orgData.registeredAppsData = [];
            return res.json(orgData);
          }

          // Create an array of promises to fetch event details and team details for each registered event
          const appPromises = orgApps.map((app) => {
            const appId = app

            // Fetch event details
            return db.collection("apps").doc(appId).get();
          });

          // Resolve all promises
          return Promise.all(appPromises);
        } else {
          // User not found
          res.status(403).json({error: "Not Authorized"});
        }
      })
      .then((results) => {
     
        // Process event details and team details
        orgData.registeredAppsData = results.map((appSnapshot) => appSnapshot.data());

        return res.json(orgData);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
      });
};


exports.forgotPassword= (req, res) =>{
  const email = req.body.email;
  const {valid, errors} = validateEmail({email});
  if (!valid) return res.status(400).json(errors);

  sendPasswordResetEmail(auth, email)
      .then(() => {
        //  console.log("Password Reset Mail sent")
        return res.status(200).json({message: "Successfully Sent Password Reset Mail"});
      })
      .catch((error) => {
        res.status(500).json({error});
      });
};
