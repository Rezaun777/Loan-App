import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

/**
 * Check if an admin has administrator role
 * @param adminId - The admin ID to check
 * @returns boolean - true if admin has administrator role, false otherwise
 */
export async function isAdminAdministrator(adminId: string): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const admins = db.collection("admins")
    
    const admin = await admins.findOne({ _id: new ObjectId(adminId) })
    return admin?.role === "administrator"
  } catch (error) {
    console.error("Error checking admin role:", error)
    return false
  }
}

/**
 * Get admin role by ID
 * @param adminId - The admin ID to check
 * @returns string - the role of the admin
 */
export async function getAdminRole(adminId: string): Promise<string | null> {
  try {
    const { db } = await connectToDatabase()
    const admins = db.collection("admins")
    
    const admin = await admins.findOne({ _id: new ObjectId(adminId) })
    return admin?.role || null
  } catch (error) {
    console.error("Error getting admin role:", error)
    return null
  }
}

/**
 * Middleware function to check if admin has required role
 * @param adminId - The admin ID to check
 * @param requiredRole - The required role ("admin" or "administrator")
 * @returns boolean - true if admin has required role or higher, false otherwise
 */
export async function hasRequiredRole(adminId: string, requiredRole: "admin" | "administrator"): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()
    const admins = db.collection("admins")
    
    const admin = await admins.findOne({ _id: new ObjectId(adminId) })
    if (!admin) return false
    
    // Administrator has access to everything
    if (admin.role === "administrator") return true
    
    // Admin has access only to admin level
    if (requiredRole === "admin" && admin.role === "admin") return true
    
    return false
  } catch (error) {
    console.error("Error checking admin role:", error)
    return false
  }
}