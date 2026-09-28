import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const categories = [
    {
      name: "Restaurants",
      slug: "restaurants",
      description: "Restaurants and food businesses",
    },
    {
      name: "Finance",
      slug: "finance",
      description: "Financial services and businesses",
    },
    {
      name: "SaaS",
      slug: "saas",
      description: "Software as a service businesses",
    },
    {
      name: "Education",
      slug: "education",
      description: "Education and learning businesses",
    },
    {
      name: "Healthcare",
      slug: "healthcare",
      description: "Healthcare businesses and services",
    },
    {
      name: "Real Estate",
      slug: "real-estate",
      description: "Real estate businesses and services",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        slug: category.slug,
      },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }

  console.log("Categories seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
   });

// eyJhbGciOiJIUzI1NiIsInR5cGUiOiJKV1QifQ.eyJyb2xlIjoiVVNFUiIsInNpZCI6ImRmMDljOWQwLWI2OTMtNDcyOC04NzA1LWMxNjEwMWI5Y2Q0NCIsInN1YiI6IjE3MDc4NmU0LTEzZDYtNGQwMi05NDA1LWFiYjk3NDA3YWQ3OSIsImlzcyI6IklORElBYmlkcy1hcGkiLCJhdWQiOiJJTkRJQWJpZHMtd2ViIiwiaWF0IjoxNzkwNTc0MjcyLCJqdGkiOiI3OTY5Y2Y2Ni00Y2QyLTQwZjItODgzNi0zZmZkNGVmZjVmN2EiLCJleHAiOjE3OTA1NzUxNzJ9.QkSFHbxOJdUHifcfu_KZ2rSpfZoh820CWwqVOc1iR8E