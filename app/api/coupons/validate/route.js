import prisma from '@/lib/prisma'
import { rateLimit } from '@/lib/rateLimit'

const couponLimiter = rateLimit({ interval: 60000, limit: 10 })

export async function POST(req) {
  try {
    // Rate limiting to prevent brute-force coupon guessing
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!couponLimiter.check(`coupon-validate-${ip}`)) {
      return new Response(JSON.stringify({ valid: false, reason: 'Too many requests. Please wait a moment.' }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    const { code } = await req.json()
    if (!code || typeof code !== 'string') return new Response(JSON.stringify({ valid: false, reason: 'No code provided' }), { status: 400, headers: { 'content-type': 'application/json' } })

    const sanitizedCode = code.trim().toUpperCase().slice(0, 50)
    if (!sanitizedCode) return new Response(JSON.stringify({ valid: false, reason: 'No code provided' }), { status: 400, headers: { 'content-type': 'application/json' } })

    const coupon = await prisma.coupon.findUnique({ where: { code: sanitizedCode } })
    if (!coupon) return new Response(JSON.stringify({ valid: false, reason: 'Invalid code' }), { status: 200, headers: { 'content-type': 'application/json' } })
    if (new Date() > coupon.expiresAt) return new Response(JSON.stringify({ valid: false, reason: 'Expired' }), { status: 200, headers: { 'content-type': 'application/json' } })
    return new Response(JSON.stringify({ valid: true, coupon }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, reason: 'Server error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
