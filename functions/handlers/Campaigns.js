const {admin, db} = require("../utils/admin");

const config = require("../utils/config");


function generateUniqueCampaignId(name) {
    const trimmedName = name.replace(/\s/g, '');
  
    // Take the first 5 characters of the trimmed name
    const truncatedName = trimmedName.slice(0, 5);
    
    const randomString = Math.random().toString(36).substring(2, 7);
    const id = `${truncatedName.toUpperCase()}-${randomString.toUpperCase()}`;
    return id;
  }

  exports.createCampaign = (request, response) => {
    const campaignName = request.body.campaignName;
    const appId = request.app.appId
    const campaignId = generateUniqueCampaignId(campaignName)
    const campaign = {
        name:campaignName,
        id:campaignId,
        users:[]
    }
    db.collection("apps").doc(appId).get()
        .then((d) => {
            const appData = d.data()
            const campaigns = appData.campaigns
            let newCampaigns
            if(campaigns){
                 newCampaigns = campaigns
                newCampaigns[campaignId] = campaign
                return db.collection("apps").doc(appId).update({campaigns:newCampaigns})
            }
            else{
                newCampaigns = {}
                newCampaigns[campaignId] = campaign
                return db.collection("apps").doc(appId).update({campaigns:newCampaigns})

            }
            
            
          
        }).then(
            d=>{
                response.json({
                    message:"successfully created a campaign"
                })
            }
        )
        .catch((err) => {
          console.error(err);
          response.status(500).json({error: "Something went wrong while deleting the App."});
        });
  };

exports.deleteCampaign = (request, response) => {
    const campaignId = request.params.campaignId;
    const appId = request.app.appId
    db.collection("apps").doc(appId).get()
        .then((d) => {
            const appData = d.data()
            const newCampaigns = appData.campaigns
            delete newCampaigns[campaignId]
            return db.collection("apps").doc(appId).update({campaigns:newCampaigns})

          
        }).then(
            d=>{
                response.json({
                    message:"successfully deleted a campaign"
                })
            }
        )
        .catch((err) => {
          console.error(err);
          response.status(500).json({error: "Something went wrong while deleting the App."});
        });
  };

  exports.joinCampaign = (request, response) => {
    const campaignId = request.params.campaignId;
    const userId = request.body.userId
    const appId = request.app.appId
    db.collection("apps").doc(appId).get()
        .then((d) => {
            const appData = d.data()
            const newCampaigns = appData.campaigns
            const changedCampaign =  newCampaigns[campaignId]
            changedCampaign.users.push(userId)
            newCampaigns[campaignId] = changedCampaign
            return db.collection("apps").doc(appId).update({campaigns:newCampaigns})

          
        }).then(
            d=>{
                response.json({
                    message:"successfully joined a campaign"
                })
            }
        )
        .catch((err) => {
          console.error(err);
          response.status(500).json({error: "Something went wrong while deleting the App."});
        });
  };


  exports.removeUserFromCampaign = (request, response) => {
    const campaignId = request.params.campaignId;
    const userId = request.body.userId
    const appId = request.app.appId
    let newUsers;
    db.collection("apps").doc(appId).get()
        .then((d) => {
            const appData = d.data()
            const newCampaigns = appData.campaigns
            const changedCampaign =  newCampaigns[campaignId]
            changedCampaign.users.push(userId)
            newUsers = changedCampaign.users.filter(user=> user != userId)
            changedCampaign.users = newUsers
            newCampaigns[campaignId] = changedCampaign
            return db.collection("apps").doc(appId).update({campaigns:newCampaigns})
        }).then(
            d=>{
                response.json({
                    message:"successfully removed a user from campaign"
                })
            }
        )
        .catch((err) => {
          console.error(err);
          response.status(500).json({error: "Something went wrong while deleting the App."});
        });
  };