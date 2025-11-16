import { neon } from "@neondatabase/serverless"
import bcrypt from "bcrypt"

const sql = neon(process.env.DATABASE_URL)

async function createDemoAdmin() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Create demo admin user
    const result = await sql`
      INSERT INTO admins (email, password, name, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id, email, name;
    `

    console.log("Demo admin created successfully:")
    console.log("Email:", result[0].email)
    console.log("Password: admin123")
    console.log("ID:", result[0].id)
  } catch (error) {
    console.error("Error creating demo admin:", error)
  }
}

createDemoAdmin()