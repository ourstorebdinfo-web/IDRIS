/**
 * Simple in-memory rate limiter for API routes.
 * 
 * Usage:
 *   import { rateLimit } from '@/lib/rateLimit'
 *   const limiter = rateLimit({ interval: 60000, limit: 5 })
 *   
 *   export async function POST(req) {
 *     const ip = req.headers.get('x-forwarded-for') || 'unknown'
 *     if (!limiter.check(ip)) {
 *       return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429 })
 *     }
 *     // ... route logic
 *   }
 */

const rateLimitMap = new Map()

export function rateLimit({ interval = 60000, uniqueTokenPerInterval = 500, limit = 10 } = {}) {
    return {
        check(identifier) {
            const now = Date.now()
            const tokenCount = rateLimitMap.get(identifier)

            if (!tokenCount || now - tokenCount.lastReset > interval) {
                rateLimitMap.set(identifier, { count: 1, lastReset: now })
                return true
            }

            tokenCount.count++
            rateLimitMap.set(identifier, tokenCount)

            // Clean old entries periodically to prevent memory leaks
            if (rateLimitMap.size > uniqueTokenPerInterval) {
                const entries = [...rateLimitMap.entries()]
                for (const [key, val] of entries) {
                    if (now - val.lastReset > interval) rateLimitMap.delete(key)
                }
            }

            return tokenCount.count <= limit
        }
    }
}
