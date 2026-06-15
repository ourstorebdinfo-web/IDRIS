import prisma from '@/lib/prisma'

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
    } catch (err) {
        return Response.json({ status: 'error', error: err.message }, { status: 500 })
    }
}
