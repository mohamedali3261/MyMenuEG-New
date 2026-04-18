import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: "mysql://root:@localhost:3306/mymenueg_db" } }
});

async function main() {
  const cats = await prisma.categories.findMany({ select: { id: true, name_ar: true, name_en: true } });
  console.log(JSON.stringify(cats, null, 2));
  await prisma.$disconnect();
}
main();
