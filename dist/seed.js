import { prisma } from "./lib/prisma.js";
export const realCategories = [
    {
        name: "Media and News",
        slug: "media-news",
        description: "Newspapers, digital media portals, newsletters, and press outlets",
    },
    {
        name: "Real Estate and Property",
        slug: "real-estate-property",
        description: "Brokers, builders, commercial property, and residential rentals",
    },
    {
        name: "Travel, Local and Lifestyle",
        slug: "travel-local-lifestyle",
        description: "Tours, travel agencies, city guides, luxury experiences, and lifestyle brands",
    },
    {
        name: "Sales and Lead Generation",
        slug: "sales-lead-generation",
        description: "B2B lead generation, cold outreach agencies, sales tech, and CRM partners",
    },
    {
        name: "Podcasting",
        slug: "podcasting",
        description: "Audio shows, podcast production agencies, hosts, and audio platforms",
    },
    {
        name: "YouTube Channels",
        slug: "youtube-channels",
        description: "Creators, video channels, review shows, and media networks",
    },
    {
        name: "Instagram Profiles & Creators",
        slug: "instagram-creators",
        description: "Influencers, creators, aesthetic brands, and social agency profiles",
    },
    {
        name: "AI Media Generation",
        slug: "ai-media-generation",
        description: "Generative AI art, synthetic media, voice synthesis, and video AI tools",
    },
    {
        name: "Writing and Content",
        slug: "writing-content",
        description: "Copywriters, ghostwriting agencies, technical writers, and content studios",
    },
    {
        name: "Fund Asking & Startups",
        slug: "fund-asking",
        description: "Early-stage founders pitching for pre-seed, seed, and angel capital",
    },
    {
        name: "Ventures (Fund Providing Companies)",
        slug: "ventures-capital",
        description: "Venture capital funds, angel syndicates, micro-VCs, and incubators",
    },
    {
        name: "Design and Creative",
        slug: "design-creative",
        description: "UI/UX agencies, branding studios, 3D artists, and creative directors",
    },
    {
        name: "Product and Management",
        slug: "product-management",
        description: "Product strategy consultants, PM tools, roadmapping, and agile services",
    },
    {
        name: "Games and Entertainment",
        slug: "games-entertainment",
        description: "Game studios, esports teams, animation houses, and interactive media",
    },
    {
        name: "Ecommerce and Retail",
        slug: "ecommerce-retail",
        description: "Direct-to-consumer brands, online stores, marketplace sellers, and retail",
    },
    {
        name: "Restaurants & Cafes",
        slug: "restaurants-cafes",
        description: "Fine dining, bistros, bakeries, cafes, and culinary brands across India",
    },
    {
        name: "Hotels & Stays",
        slug: "hotels-stays",
        description: "Boutique hotels, luxury resorts, homestays, and bed & breakfasts",
    },
    {
        name: "Local Dhaba in State",
        slug: "local-dhaba",
        description: "Highway dhabas, local food spots, authentic regional delicacies",
    },
    {
        name: "Education and Learning",
        slug: "education-learning",
        description: "EdTech, coaching institutes, online academies, and skill bootcamps",
    },
    {
        name: "Hiring and Jobs Careers",
        slug: "hiring-jobs-careers",
        description: "Staffing agencies, job boards, headhunters, and executive recruitment",
    },
    {
        name: "Health, Fitness and Wellness",
        slug: "health-fitness-wellness",
        description: "Gyms, yoga studios, health supplements, fitness coaching, and nutrition",
    },
    {
        name: "Developer Tools and GitHub Accounts",
        slug: "developer-tools-github",
        description: "Open-source projects, developer tools, CLI utilities, and engineering profiles",
    },
    {
        name: "Crypto, Web3 and Investing",
        slug: "crypto-web3-investing",
        description: "Web3 protocols, crypto research, wealth advisory, and algorithmic trading",
    },
];
export const indianStates = [
    "Delhi",
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Telangana",
    "Gujarat",
    "Uttar Pradesh",
    "West Bengal",
    "Rajasthan",
    "Kerala",
    "Punjab",
    "Haryana",
    "Andhra Pradesh",
    "Madhya Pradesh",
    "Bihar",
    "Odisha",
    "Assam",
    "Goa",
    "Jharkhand",
    "Chhattisgarh",
    "Uttarakhand",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Chandigarh",
    "Puducherry",
    "Tripura",
    "Meghalaya",
    "Manipur",
    "Nagaland",
    "Arunachal Pradesh",
    "Mizoram",
    "Sikkim",
    "Ladakh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
];
export async function cleanAndSeed() {
    console.log("Purging all previous test data from Postgres...");
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "PaymentWebhookEvent", "Bid", "Payment", "BoardMembership", "Business", "AuthSession", "User" CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Board", "Category" CASCADE;`);
    console.log(`Database clean! Now seeding 23 real categories and 36 states/UTs boards...`);
    let totalBoards = 0;
    for (const catData of realCategories) {
        const category = await prisma.category.create({
            data: {
                name: catData.name,
                slug: catData.slug,
                description: catData.description,
            },
        });
        // 1. National Board (scope: NATIONAL, state: null, minBidPaise: 50,000 = ₹500)
        const nationalKey = `${category.slug}-national`;
        await prisma.board.create({
            data: {
                categoryId: category.id,
                key: nationalKey,
                name: `${category.name} - National`,
                scope: "NATIONAL",
                state: null,
                country: "IN",
                minBidPaise: 50000n, // ₹500
                bidIncrementPaise: 100n, // ₹1
                status: "ACTIVE",
            },
        });
        totalBoards++;
        // 2. State Boards (scope: STATE, state: stateName, minBidPaise: 10,000 = ₹100)
        for (const state of indianStates) {
            const stateKey = `${category.slug}-${state.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            await prisma.board.create({
                data: {
                    categoryId: category.id,
                    key: stateKey,
                    name: `${category.name} - ${state}`,
                    scope: "STATE",
                    state,
                    country: "IN",
                    minBidPaise: 10000n, // ₹100
                    bidIncrementPaise: 100n, // ₹1
                    status: "ACTIVE",
                },
            });
            totalBoards++;
        }
    }
    console.log(`Successfully seeded ${realCategories.length} categories and ${totalBoards} boards.`);
}
if (process.argv[1]?.endsWith("seed.ts")) {
    cleanAndSeed()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error("Seed error:", err);
        process.exit(1);
    });
}
