import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "LoadProfit — Know if a freight offer is worth taking",
  description:
    "Estimate trip profitability before you accept. Live fuel context, real route distance, and vehicle-based costs for transport operators.",
  openGraph: {
    title: "LoadProfit — Know if a freight offer is worth taking",
    description:
      "Estimate trip profitability before you accept. Built for small freight businesses and operators.",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
