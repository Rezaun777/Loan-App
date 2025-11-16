import { NextRequest, NextResponse } from "next/server"
import { getAdminRole } from "@/lib/admin-auth"

/**
 * Middleware to protect admin routes based on role requirements
 * @param request - The incoming request
 * @param requiredRole - The minimum required role ("admin" or "administrator")
 * @returns NextResponse - Redirects if not authorized, continues if authorized
 */
export async function withAdminAuth(
  request: NextRequest,
  requiredRole: "admin" | "administrator" = "admin"
): Promise<NextResponse | null> {
  try {
    // Get adminId from localStorage (in a real app, this would come from a session cookie)
    // For API routes, we need to pass adminId as a header or query parameter
    const adminId = request.headers.get("x-admin-id")
    
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized: No admin ID provided" }, { status: 401 })
    }

    const role = await getAdminRole(adminId)
    
    if (!role) {
      return NextResponse.json({ error: "Unauthorized: Admin not found" }, { status: 401 })
    }

    // Check role permissions
    if (requiredRole === "administrator" && role !== "administrator") {
      return NextResponse.json({ error: "Forbidden: Administrator access required" }, { status: 403 })
    }

    // If we get here, the admin is authorized
    return null // null means authorized, continue with the request
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}