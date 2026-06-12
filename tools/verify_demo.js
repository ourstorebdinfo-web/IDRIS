const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Sample ' } },
        { description: { contains: 'sample' } },
      ],
    },
    select: { id: true, name: true, description: true, categoryId: true },
  })
  console.log('PRODUCTS', products.length)
  console.log(JSON.stringify(products, null, 2))

  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { in: ['Earbuds', 'Watch', 'Speakers'] } },
        { slug: { in: ['earbuds', 'watch', 'speakers'] } },
      ],
    },
    select: { id: true, name: true, slug: true },
  })
  console.log('CATEGORIES', categories.length)
  console.log(JSON.stringify(categories, null, 2))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
