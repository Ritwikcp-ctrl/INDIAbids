import { BlogIndexClient } from "@/components/blog-index-client";
import { getAllPublishedPosts } from "@/lib/blog";

export default function BlogIndexPage() {
  const posts = getAllPublishedPosts();
  return <BlogIndexClient posts={posts} basePath="" />;
}
