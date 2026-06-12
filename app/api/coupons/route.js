import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ coupons }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch coupons' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })

    const body = await req.json()

    // --- Validation ---
    if (!body.code || typeof body.code !== 'string' || !body.code.trim()) {
      return new Response(JSON.stringify({ error: 'Coupon code is required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    if (body.discount === undefined || isNaN(Number(body.discount)) || Number(body.discount) <= 0) {
      return new Response(JSON.stringify({ error: 'Discount must be a positive number' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    const discount = Number(body.discount)
    if (discount > 100) {
      return new Response(JSON.stringify({ error: 'Discount percentage cannot exceed 100%' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    if (!body.expiresAt) {
      return new Response(JSON.stringify({ error: 'Expiry date is required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    const expiresAt = new Date(body.expiresAt)
    if (isNaN(expiresAt.getTime())) {
      return new Response(JSON.stringify({ error: 'Invalid expiry date' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // Check duplicate code
    const existing = await prisma.coupon.findFirst({ where: { code: body.code.trim().toUpperCase() } })
    if (existing) {
      return new Response(JSON.stringify({ error: 'Coupon code already exists' }), { status: 409, headers: { 'content-type': 'application/json' } })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.trim().toUpperCase(),
        description: body.description || '',
        discount,
        forNewUser: Boolean(body.forNewUser),
        forMember: Boolean(body.forMember),
        isPublic: body.isPublic !== undefined ? Boolean(body.isPublic) : true,
        expiresAt,
      }
    })
    return new Response(JSON.stringify(coupon), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create coupon' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
