import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tejas | Developer",
  description:
    "Engineer / Gamer building CrossPnP, AI systems, open source tools, and full-stack products.",
};

export default function TejasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="tejas-portfolio-font min-h-screen">{children}</div>;
}
