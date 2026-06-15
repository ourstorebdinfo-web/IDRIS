import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { rateLimit } from '@/lib/rateLimit'

const orderLimiter = rateLimit({ interval: 60000, limit: 10 })

function getUserIdFromToken(token) {
  return token?.sub || token?.id || token?.user?.id
}

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    // allow guests: return empty list if not authenticated
    if (!token) return new Response(JSON.stringify({ orders: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    const userId = getUserIdFromToken(token)
    if (!userId) {
      console.warn('Could not extract userId from token')
      return new Response(JSON.stringify({ orders: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const include = { orderItems: { include: { product: true } }, address: true }
    let orders
    try {
      orders = await prisma.order.findMany({ where: { userId, OR: [{ isDeleted: false }, { isDeleted: null }] }, include })
    } catch (err) {
      if (/isDeleted/i.test(err.message)) {
        orders = await prisma.order.findMany({ where: { userId }, include })
      } else {
        throw err
      }
    }
    return new Response(JSON.stringify({ orders }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch orders', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!orderLimiter.check(`order-${ip}`)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), { status: 429, headers: { 'content-type': 'application/json' } })
    }

    // allow guest checkout: token optional
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token ? getUserIdFromToken(token) : undefined
    const body = await req.json()
    const { addressId, items, paymentMethod, coupon, deliveryCharge, transactionId } = body
    if (!addressId) return new Response(JSON.stringify({ error: 'ঠিকানা সিলেক্ট করুন' }), { status: 400, headers: { 'content-type': 'application/json' } })
    if (!items || !Array.isArray(items) || items.length === 0) return new Response(JSON.stringify({ error: 'কার্ট খালি, অর্ডার করা যাচ্ছে না' }), { status: 400, headers: { 'content-type': 'application/json' } })
    if (!paymentMethod || typeof paymentMethod !== 'string') return new Response(JSON.stringify({ error: 'পেমেন্ট মেথড সিলেক্ট করুন' }), { status: 400, headers: { 'content-type': 'application/json' } })

    // compute total and verify products
    let subtotal = 0
    const orderItemsData = []
    // verify address exists to avoid foreign key errors
    const addrExists = await prisma.address.findUnique({ where: { id: addressId } })
    if (!addrExists) return new Response(JSON.stringify({ error: 'ঠিকানা খুঁজে পাওয়া যায়নি, আবার চেষ্টা করুন' }), { status: 400, headers: { 'content-type': 'application/json' } })
    const productIds = items.map(it => it.productId || it.id).filter(Boolean)
    if (productIds.length === 0) return new Response(JSON.stringify({ error: 'পণ্যের তথ্য পাওয়া যায়নি' }), { status: 400, headers: { 'content-type': 'application/json' } })
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    for (const it of items) {
      const pid = it.productId || it.id
      const product = productMap.get(pid)
      if (!product) return new Response(JSON.stringify({ error: `পণ্যটি খুঁজে পাওয়া যায়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।` }), { status: 400, headers: { 'content-type': 'application/json' } })
      const price = parseFloat(product.price)
      const quantity = parseInt(it.quantity)
      if (!Number.isFinite(quantity) || quantity <= 0) return new Response(JSON.stringify({ error: `পণ্যের পরিমাণ সঠিক নয়` }), { status: 400, headers: { 'content-type': 'application/json' } })
      subtotal += price * quantity
      orderItemsData.push({ 
        productId: pid, 
        quantity, 
        price, 
        color: it.color || null, 
        size: it.size || null 
      })
    }

    // add delivery charge to total
    const parsedDeliveryCharge = Number.isFinite(parseFloat(deliveryCharge)) ? parseFloat(deliveryCharge) : 0
    
    // Validate coupon and calculate discount on the server
    let discountAmount = 0
    let couponData = {}
    if (coupon && coupon.code) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: coupon.code.trim().toUpperCase() }
      })
      if (!dbCoupon) {
        return new Response(JSON.stringify({ error: 'Invalid coupon code' }), { status: 400, headers: { 'content-type': 'application/json' } })
      }
      if (new Date() > dbCoupon.expiresAt) {
        return new Response(JSON.stringify({ error: 'Coupon code has expired' }), { status: 400, headers: { 'content-type': 'application/json' } })
      }
      const discountPercent = parseFloat(dbCoupon.discount) || 0
      discountAmount = (discountPercent / 100) * subtotal
      couponData = {
        code: dbCoupon.code,
        description: dbCoupon.description,
        discount: dbCoupon.discount,
        discountAmount: discountAmount
      }
    }

    const total = Math.max(0, subtotal - discountAmount) + parsedDeliveryCharge

    // store coupon + transactionId + delivery info in coupon JSON field
    if (transactionId) couponData.transactionId = transactionId
    if (parsedDeliveryCharge > 0) couponData.deliveryCharge = parsedDeliveryCharge

    const order = await prisma.order.create({
      data: {
        total,
        userId: userId || undefined,
        addressId,
        paymentMethod,
        coupon: JSON.stringify(couponData),
        isCouponUsed: Object.keys(couponData).length > 0,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: true }
    })

    return new Response(JSON.stringify(order), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    // log and surface the real error message to help debugging
    console.error('POST /api/orders error:', err)
    const message = 'অর্ডার তৈরি করতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
    return new Response(JSON.stringify({ error: message, _debug: process.env.NODE_ENV === 'development' ? err?.message : undefined }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
