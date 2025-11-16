const { MongoClient, ObjectId } = require("mongodb")

async function updateAdminRole() {
  // Using the same URI from lib/db.ts
  const uri = process.env.MONGODB_URI || "mongodb+srv://secret007:IhUq4QquSZlpEqR0@cluster0.v4dxro1.mongodb.net/?appName=Cluster0"
  
  if (!uri) {
    console.log("❌ MONGODB_URI is not defined")
    process.exit(1)
  }

  const adminEmail = process.argv[2]; // Get admin email from command line argument
  
  if (!adminEmail) {
    console.log("❌ Please provide an admin email as argument")
    console.log("Usage: node scripts/update-admin-role.js <admin-email>")
    process.exit(1)
  }

  let client
  try {
    console.log(`Updating admin role for ${adminEmail}...`)
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")
    
    const db = client.db("loan_app")
    
    // Check if admin exists
    const adminsCollection = db.collection("admins")
    const admin = await adminsCollection.findOne({ email: adminEmail })
    
    if (!admin) {
      console.log(`❌ Admin with email ${adminEmail} not found`)
      process.exit(1)
    }
    
    console.log(`Found admin: ${admin.name} (${admin.email})`)
    console.log(`Current role: ${admin.role || 'N/A (default: admin)'}`)
    
    // Update role to administrator
    const result = await adminsCollection.updateOne(
      { _id: admin._id },
      { $set: { role: "administrator", updatedAt: new Date() } }
    )
    
    if (result.modifiedCount > 0) {
      console.log("✅ Admin role updated to 'administrator' successfully!")
    } else {
      console.log("ℹ️  No changes were made (role might already be 'administrator')")
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

updateAdminRole()