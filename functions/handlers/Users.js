const { db } = require("../utils/admin");

exports.registerUserAsSubscriber = (request, response) => {
    const userIdentifier = request.body.userIdentifier
    const notificationToken = request.body.notificationToken
    const appId = request.app.appId

    const userData = {
        appId,
        userIdentifier,
        notificationToken,
        status:"subscribed"
    }

    db.doc(`/users/${userIdentifier}`).set(userData)
        .then((doc) => {
          if (doc.exists) {
            return response.status(400).json({error: "user already exists"});
          }
          
          return db.doc(`/apps/${appId}`).get()
        }).then(
            doc=>{
                const appData  = doc.data()
                const userIds = appData.userIds
                userIds.push(userIdentifier)
                return db.doc(`/apps/${appId}`).update({
                    userIds
                })


            }
        ).then(
            response.status(201).json({message :"Added User as Subscriber"})
        )
        .catch((err) => {
          console.error(err);
          response.status(500).json({error: err.message || "Something went wrong while fetching the App data."});
        });
  };
  