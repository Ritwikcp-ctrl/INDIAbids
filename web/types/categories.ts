export interface CategoryDefinition {
  name: string;
  slug: string;
  description: string;
}

export const REAL_CATEGORIES: CategoryDefinition[] = [
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
