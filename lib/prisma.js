import { PrismaClient } from '@prisma/client'

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

// Run performance optimizations for SQLite under concurrent traffic
const initDb = async () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }
  try {
    await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;')
    await prisma.$queryRawUnsafe('PRAGMA busy_timeout=5000;')
    await prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL;')
  } catch (err) {
    console.error('Failed to apply SQLite performance optimizations:', err)
  }
}
initDb()

export default prisma
