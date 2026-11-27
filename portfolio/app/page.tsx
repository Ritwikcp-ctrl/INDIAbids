import { PortfolioView } from "@/components/portfolio-view";
import { getAllPublishedPosts } from "@/lib/blog";

export default function HomePage() {
  const posts = getAllPublishedPosts();
  return <PortfolioView posts={posts} />;
}
