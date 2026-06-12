const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123'

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.')
  }

  const hashed = await bcrypt.hash(password, 10)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hashed, role: 'ADMIN', name: 'Admin' } })
    console.log('Updated admin user:', email)
  } else {
    await prisma.user.create({ data: { email, name: 'Admin', password: hashed, role: 'ADMIN' } })
    console.log('Created admin user:', email)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
