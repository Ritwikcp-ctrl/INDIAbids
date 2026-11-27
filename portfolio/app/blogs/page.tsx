import { redirect } from "next/navigation";

export default function LegacyBlogsRedirect() {
  redirect("/blog");
}
