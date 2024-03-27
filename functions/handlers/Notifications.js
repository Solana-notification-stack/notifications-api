const {db, admin} = require("../utils/admin");
exports.sendNotificationToAll = (req,res)=>{
    const notificationBody = req.body.notificationBody
    const notificationTitle = req.body.notificationTitle
    const appId = req.app.appId
    
    let tokens = []
    db.collection("apps").doc(appId).get().then(
        d=>{
            const appData = a.data()
            const userIds = appData.userIds
            return userIds
        }
    ).then(userIds=>{
        const usersPromises = userIds.map((userId) => {
            return db.collection("users").doc(userId).get()
                .then((userDoc) => userDoc.data())
                .catch((err) => {
                  console.error(err);
                  return null;
                });
          });
          return Promise.all(usersPromises);
    }).then(usersData=>{
        usersData.map(user=>{
            tokens.push(user.notificationToken)
        })
        const payload ={
            notification:{
                title:notificationTitle,
                body:notificationBody
            },
            tokens
        
        }
        return admin.messaging().sendEachForMulticast(payload,true)
    }).then(
        res.status(200).json({ message : "successully sent notifications"})
    ).catch(err=>{
        console.log(err)
        res.status(500).json({err})
    })


}