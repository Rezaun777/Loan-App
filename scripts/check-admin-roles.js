const { MongoClient, ObjectId } = require("mongodb")

async function checkAdminRoles() {
  // Using the same URI from lib/db.ts
  const uri = process.env.MONGODB_URI || "mongodb+srv://secret007:IhUq4QquSZlpEqR0@cluster0.v4dxro1.mongodb.net/?appName=Cluster0"
  
  if (!uri) {
    console.log("❌ MONGODB_URI is not defined")
    process.exit(1)
  }

  let client
  try {
    console.log("Connecting to MongoDB...")
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")
    
    const db = client.db("loan_app")
    
    // Check admins collection
    const adminsCollection = db.collection("admins")
    const admins = await adminsCollection.find({}).toArray()
    
    console.log("\n=== Admins Collection ===")
    if (admins.length === 0) {
      console.log("No documents found in admins collection")
    } else {
      console.log(`Found ${admins.length} admin(s):`)
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Name: ${admin.name || 'N/A'}`)
        console.log(`   Email: ${admin.email || 'N/A'}`)
        console.log(`   Role: ${admin.role || 'N/A (default: admin)'}`)
        console.log(`   ID: ${admin._id || 'N/A'}`)
        console.log("---")
      })
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

checkAdminRoles()