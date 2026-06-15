import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from '@/lib/rateLimit'

const contactLimiter = rateLimit({ interval: 60000, limit: 5 })

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ messages }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!contactLimiter.check(`contact-${ip}`)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    const body = await req.json()
    const { name, email, message, website } = body

    // Honeypot: bots fill hidden fields, real users never do
    if (website) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // Server-side validation
    const trimmedName = String(name).trim().slice(0, 100)
    const trimmedEmail = String(email).trim().toLowerCase().slice(0, 254)
    const trimmedMessage = String(message).trim().slice(0, 2000)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (trimmedName.length < 2) {
      return new Response(JSON.stringify({ error: 'Name must be at least 2 characters' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    if (trimmedMessage.length < 10) {
      return new Response(JSON.stringify({ error: 'Message must be at least 10 characters' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const contactMessage = await prisma.contactMessage.create({ data: { name: trimmedName, email: trimmedEmail, message: trimmedMessage } })
    return new Response(JSON.stringify(contactMessage), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to submit message' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
