const {db, admin} = require("./admin");


module.exports = (req, res, next)=>{
    let appSecret;
    if (req.headers.authorization) {
        appSecret = req.headers.authorization
      } else {
        console.log("Not authorised");
        return res.status(403).json({error: "unauthorized"});
      }
      db.collection("apps").where("appSecret", "==", appSecret).limit(1).get().then(
        data=>{
            req.app = data.docs[0].data()
            return next()
        }
      ).catch(err=>{
        console.log("error whike verifying api key", err);
        return res.status(400).json({err});
      })

}




