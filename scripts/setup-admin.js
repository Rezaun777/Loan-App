const MongoClient = require("mongodb").MongoClient
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI

async function setupAdmin() {
  if (!MONGODB_URI) {
    console.log("❌ MONGODB_URI not set")
    process.exit(1)
  }

  let client
  try {
    console.log("🔧 Connecting to MongoDB...")
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("loan_app")
    const admins = db.collection("admins")

    // Check if admin already exists
    const existingAdmin = await admins.findOne({ email: "admin@loan.com" })

    if (existingAdmin) {
      console.log("✅ Admin account already exists")
      console.log("📧 Email: admin@loan.com")
      console.log("🔐 Password: admin123")
      process.exit(0)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Create admin account
    const result = await admins.insertOne({
      email: "admin@loan.com",
      password: hashedPassword,
      name: "Admin",
      createdAt: new Date(),
    })

    console.log("✅ Admin account created successfully!")
    console.log("📧 Email: admin@loan.com")
    console.log("🔐 Password: admin123")
    console.log("🆔 Admin ID:", result.insertedId)
  } catch (error) {
    console.error("❌ Error setting up admin:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

setupAdmin()
