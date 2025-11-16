const { MongoClient } = require("mongodb")

async function checkSettings() {
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
    
    // Check settings collection
    const settingsCollection = db.collection("settings")
    const settings = await settingsCollection.find({}).toArray()
    
    console.log("\n=== Settings Collection ===")
    if (settings.length === 0) {
      console.log("No documents found in settings collection")
    } else {
      console.log(`Found ${settings.length} document(s):`)
      settings.forEach((setting, index) => {
        console.log(`${index + 1}. Key: ${setting.key || 'N/A'}`)
        console.log(`   Value: ${setting.value || 'N/A'}`)
        console.log(`   Updated: ${setting.updatedAt || 'N/A'}`)
        console.log("---")
      })
    }
    
    // Check specifically for transferNumber setting
    const transferNumberSetting = await settingsCollection.findOne({ key: "transferNumber" })
    console.log("\n=== Transfer Number Setting ===")
    if (transferNumberSetting) {
      console.log("Found transferNumber setting:")
      console.log(`Key: ${transferNumberSetting.key}`)
      console.log(`Value: ${transferNumberSetting.value}`)
      console.log(`Updated: ${transferNumberSetting.updatedAt || 'N/A'}`)
    } else {
      console.log("No transferNumber setting found")
      
      // Create a default transferNumber setting
      console.log("Creating default transferNumber setting...")
      await settingsCollection.insertOne({
        key: "transferNumber",
        value: "01700-000000",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log("✅ Default transferNumber setting created successfully!")
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

checkSettings()