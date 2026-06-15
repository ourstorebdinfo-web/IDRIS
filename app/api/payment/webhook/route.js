import Stripe from 'stripe'
import prisma from '@/lib/prisma'

// Safely create Stripe instance — won't crash if key is missing
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(req) {
  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 503, headers: { 'content-type': 'application/json' } })
  }

  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not configured — rejecting request')
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 503, headers: { 'content-type': 'application/json' } })
  }
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (orderId) {
      try {
        await prisma.order.update({ where: { id: orderId }, data: { isPaid: true } })
      } catch (err) {
        // log but don't fail webhook
        console.error('Failed to update order payment status:', err)
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } })
}
