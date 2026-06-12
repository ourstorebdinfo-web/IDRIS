const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Connecting to DB...')
  // Delete sample products
  const delProducts = await prisma.product.deleteMany({ where: { name: { startsWith: 'Sample ' } } })
  console.log('Deleted products:', delProducts.count)
  // Delete sample categories
  const delCats = await prisma.category.deleteMany({ where: { name: { in: ['Earbuds','Watch','Speakers'] } } })
  console.log('Deleted categories:', delCats.count)
  // Delete welcome coupon
  const delCoupon = await prisma.coupon.deleteMany({ where: { code: 'WELCOME10' } })
  console.log('Deleted coupons:', delCoupon.count)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
