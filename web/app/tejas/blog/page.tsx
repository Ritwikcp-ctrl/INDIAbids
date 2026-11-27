import { BlogIndexClient } from "@/components/portfolio/blog-index-client";
import { getAllPublishedPosts } from "@/lib/blog";

export default function TejasBlogIndexPage() {
  const posts = getAllPublishedPosts();
  return <BlogIndexClient posts={posts} basePath="/tejas" />;
}
