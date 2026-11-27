import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "INDIAbids — Rank is what you pay. Relevance is where you compete.",
  description:
    "A paid leaderboard where Indian businesses bid for rank within a category across National and State boards. Pay and claim rank instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="font-gothic">
      <body className="min-h-screen bg-background text-foreground font-gothic antialiased selection:bg-primary/25 selection:text-primary">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
