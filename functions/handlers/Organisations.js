
const {admin,db} = require("../utils/admin")
function generateUniqueOrganisationId(name) {
    // Ensure the name is at least 5 characters long
    const truncatedName = name.slice(0, 5);
  
    // Generate a random 5-character string
    const randomString = Math.random().toString(36).substring(2, 7);
  
    // Combine the "BLITZ" prefix, truncated name, and random string
    const orgId = `Org-${truncatedName.toUpperCase()}-${randomString.toUpperCase()}`;
  
    return orgId;
  }


  
