import { prisma } from "./lib/prisma.js";
import { updateRedisLeaderboard, reconcileBoardLeaderboard } from "./lib/redis.js";
const categoriesData = [
    {
        name: "Tech & AI",
        slug: "tech-ai",
        description: "SaaS, AI products, dev tools, and IT services in India",
    },
    {
        name: "E-Commerce & D2C",
        slug: "ecommerce-d2c",
        description: "Consumer brands, online retailers, and direct-to-consumer businesses",
    },
    {
        name: "Finance & FinTech",
        slug: "fintech",
        description: "Payments, wealth, insurance, lending, and crypto services",
    },
    {
        name: "Healthcare & Meds",
        slug: "healthcare",
        description: "Clinics, diagnostics, wellness, telemedicine, and pharma",
    },
    {
        name: "Legal & CA Services",
        slug: "legal-ca",
        description: "Advocates, chartered accountants, IP attorneys, and compliance advisors",
    },
    {
        name: "Real Estate & Co-Working",
        slug: "real-estate",
        description: "Developers, property consultants, co-working, and commercial leasing",
    },
];
const sampleStates = ["Delhi", "Maharashtra", "Karnataka", "Telangana", "Tamil Nadu"];
export async function seed() {
    console.log("Starting INDIAbids seed...");
    for (const catData of categoriesData) {
        const category = await prisma.category.upsert({
            where: { slug: catData.slug },
            update: {
                name: catData.name,
                description: catData.description,
            },
            create: {
                name: catData.name,
                slug: catData.slug,
                description: catData.description,
            },
        });
        // 1. National Board (scope: NATIONAL, state: null, minBidPaise: 50,000 = ₹500)
        const nationalKey = `${category.slug}-national`;
        const nationalBoard = await prisma.board.upsert({
            where: { key: nationalKey },
            update: {
                name: `${category.name} - National`,
                scope: "NATIONAL",
                state: null,
                minBidPaise: 50000n,
                bidIncrementPaise: 100n,
                status: "ACTIVE",
            },
            create: {
                categoryId: category.id,
                key: nationalKey,
                name: `${category.name} - National`,
                scope: "NATIONAL",
                state: null,
                country: "IN",
                minBidPaise: 50000n,
                bidIncrementPaise: 100n,
                status: "ACTIVE",
            },
        });
        // 2. State Boards (scope: STATE, state: "Delhi", minBidPaise: 10,000 = ₹100)
        for (const state of sampleStates) {
            const stateKey = `${category.slug}-${state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            await prisma.board.upsert({
                where: { key: stateKey },
                update: {
                    name: `${category.name} - ${state}`,
                    scope: "STATE",
                    state,
                    minBidPaise: 10000n,
                    bidIncrementPaise: 100n,
                    status: "ACTIVE",
                },
                create: {
                    categoryId: category.id,
                    key: stateKey,
                    name: `${category.name} - ${state}`,
                    scope: "STATE",
                    state,
                    country: "IN",
                    minBidPaise: 10000n,
                    bidIncrementPaise: 100n,
                    status: "ACTIVE",
                },
            });
        }
    }
    console.log("Seeded categories and national/state boards successfully.");
}
if (process.argv[1]?.endsWith("seed.ts")) {
    seed()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error("Seed error:", err);
        process.exit(1);
    });
}
