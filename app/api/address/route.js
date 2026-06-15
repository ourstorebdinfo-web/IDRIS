import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from '@/lib/rateLimit'

const addressLimiter = rateLimit({ interval: 60000, limit: 15 })

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const userId = token?.sub || token?.id || token?.user?.id
    const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ addresses }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch addresses' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!addressLimiter.check(`addr-${ip}`)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    // allow guest address creation; attach userId when available
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token ? (token.sub || token.id || token.user?.id) : undefined
    const body = await req.json()

    // Validate required fields
    const requiredFields = ['name', 'street', 'city', 'state', 'zip', 'country', 'phone']
    const missingFields = requiredFields.filter(f => !body[f] || (typeof body[f] === 'string' && !body[f].trim()))
    if (missingFields.length > 0) {
      const fieldLabels = { name: 'নাম', street: 'ঠিকানা', city: 'শহর', state: 'জেলা', zip: 'জিপ কোড', country: 'দেশ', phone: 'ফোন' }
      const missing = missingFields.map(f => fieldLabels[f] || f).join(', ')
      return new Response(JSON.stringify({ error: `অনুগ্রহ করে পূরণ করুন: ${missing}` }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // Fix #14: Whitelist only expected fields to prevent mass assignment
    const sanitized = {
      name: body.name.trim(),
      email: (body.email && body.email.trim()) || 'N/A',
      street: body.street.trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      zip: body.zip.trim(),
      country: body.country.trim(),
      phone: body.phone.trim(),
    }

    const data = userId ? { userId, ...sanitized } : sanitized
    const addr = await prisma.address.create({ data })
    return new Response(JSON.stringify(addr), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('POST /api/address error:', err)
    return new Response(JSON.stringify({ error: 'ঠিকানা সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
