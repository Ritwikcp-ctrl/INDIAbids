import "dotenv/config";

import { prisma } from "./lib/prisma";

async function main() {
  const category = await prisma.category.create({
    data: {
      name: "Restaurants Test",
      slug: "restaurants-test",
      description: "Test category",
    },
  });

  console.log(category);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });