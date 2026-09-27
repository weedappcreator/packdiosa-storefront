import type { Metadata } from "next";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { PricingLadder } from "@/components/home/PricingLadder";
import { TrustSignals } from "@/components/home/TrustSignals";
import { WholesaleSection } from "@/components/home/WholesaleSection";
import { resolveCurrency } from "@/lib/data/markets";
import { generateHomeMetadata } from "@/lib/metadata/home";

interface HomePageProps {
  params: Promise<{
    country: string;
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { country, locale } = await params;
  return generateHomeMetadata({ country, locale });
}

export default async function HomePage({ params }: HomePageProps) {
  const { country, locale } = await params;
  const basePath = `/${country}/${locale}`;
  const currency = await resolveCurrency(country);

  return (
    <div>
      <HeroSection basePath={basePath} locale={locale} />
      <TrustSignals />
      <FeaturedProductsSection
        basePath={basePath}
        locale={locale}
        country={country}
        currency={currency}
      />
      <PricingLadder basePath={basePath} />
      <WholesaleSection basePath={basePath} locale={locale} />
    </div>
  );
}
