const {db,admin} = require("./admin")


module.exports  = (req,res,next)=>{
    let idToken ;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
        idToken = req.headers.authorization.split("Bearer ")[1]
        console.log(idToken)

    }
    else{
        console.log("Not authorised")
        return res.status(403).json({error: "unauthorized"})
    }

    admin.auth().verifyIdToken(idToken).then(
        decodedToken =>{
            console.log()
            req.org = decodedToken
            return db.collection("organisations").where("orgId" ,"==",req.org.uid ).limit(1).get()
        }
    )
    .then(
        data=>{
            req.org.orgId = data.docs[0].data().orgId
            return next()
        }
    ).catch(
        err=>{
            console.log("error whike verifying toekn",err)
            return res.status(400).json({err})

        }
    )


}