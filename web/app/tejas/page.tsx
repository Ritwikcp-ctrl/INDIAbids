import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { getAllPublishedPosts } from "@/lib/blog";

export default function TejasPortfolioPage() {
  const posts = getAllPublishedPosts();
  return <PortfolioView showBackToIndiabids posts={posts} />;
}
