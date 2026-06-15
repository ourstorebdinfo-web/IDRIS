import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export const authOptions = {
  // NOTE: PrismaAdapter intentionally removed.
  // NextAuth v4 has a known issue where PrismaAdapter + CredentialsProvider
  // conflicts: the adapter tries to create a database session on sign-in
  // even when strategy is "jwt", causing the credentials flow to fail
  // silently.  Since we only use CredentialsProvider with JWT sessions,
  // the adapter is not needed.
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials) return null
          const { email, password } = credentials
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.password) {
            return null
          }
          const isValid = await compare(password, user.password)
          if (!isValid) {
            return null
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (err) {
          console.error("[auth] authorize error:", err)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.image = token.picture || token.image
        session.user.email = token.email || session.user.email
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

