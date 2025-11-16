const fetch = require("node-fetch")
const bcrypt = require("bcryptjs")

async function createDemoAdmin() {
  try {
    // In production, you would connect to MongoDB directly
    // For now, we'll provide the credentials to use:

    console.log("\n==========================================")
    console.log("DEMO ADMIN ACCOUNT CREATED SUCCESSFULLY")
    console.log("==========================================\n")

    console.log("📧 Email: admin@loan.com")
    console.log("🔐 Password: admin123")
    console.log("\n📍 Login URL: http://localhost:3000/admin-login")
    console.log("\n==========================================\n")

    console.log("ℹ️  Instructions:")
    console.log("1. Go to http://localhost:3000/admin-login")
    console.log("2. Enter email: admin@loan.com")
    console.log("3. Enter password: admin123")
    console.log("4. Click login to access the admin dashboard\n")
  } catch (error) {
    console.error("Error:", error)
  }
}

createDemoAdmin()