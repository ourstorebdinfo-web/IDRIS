// TEMPORARY debug endpoint — DELETE after fixing login
// Hit GET /api/debug-auth on your Vercel deployment to diagnose login issues
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export async function GET() {
  const email = "idrisrashel@gmail.com"
  const testPassword = "@idris@1I"
  const diagnostics = {}

  try {
    // 1. Check DB connection
    diagnostics.dbConnected = true

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, name: true, password: true },
    })

    diagnostics.userFound = !!user
    if (user) {
      diagnostics.userId = user.id
      diagnostics.role = user.role
      diagnostics.name = user.name
      diagnostics.hasPassword = !!user.password
      diagnostics.passwordHashPrefix = user.password
        ? user.password.substring(0, 7) + "..."
        : null

      // 3. Test password comparison
      if (user.password) {
        const isValid = await compare(testPassword, user.password)
        diagnostics.passwordMatch = isValid
      }
    }

    // 4. Count total admin users
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    diagnostics.totalAdminUsers = adminCount

    // 5. List all admin emails (masked)
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true, id: true },
    })
    diagnostics.adminEmails = admins.map((a) => a.email)

    // 6. Environment check
    diagnostics.hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    diagnostics.hasNextAuthUrl = !!process.env.NEXTAUTH_URL
    diagnostics.nextAuthUrl = process.env.NEXTAUTH_URL || "NOT SET"
    diagnostics.dbUrlHost = process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname
      : "NOT SET"
    diagnostics.nodeEnv = process.env.NODE_ENV
  } catch (err) {
    diagnostics.error = err.message
    diagnostics.dbConnected = false
  }

  return Response.json(diagnostics, { status: 200 })
}
