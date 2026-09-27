import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getStoreName } from "@/lib/store";

interface HeroSectionProps {
  basePath: string;
  locale: string;
}

export async function HeroSection({ basePath, locale }: HeroSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return (
    <section className="relative min-h-[90vh] md:min-h-[80vh] flex items-center overflow-hidden bg-[#0f1a24]">
      {/* Subtle gold gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1a24] via-[#0f1a24] to-[#1a2b3c] opacity-90" />

      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent opacity-40" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="text-[#c8aa6e] text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            Nova Cargo — Wholesale Distribution
          </p>

          {/* Main headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#faf9f7] leading-[1.1]">
            Premium Wholesale
            <br />
            <span className="text-[#c8aa6e]">At Scale</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg md:text-xl text-[#9ca3af] max-w-xl leading-relaxed">
            Containers, pallets, and apparel for independent retailers. Bulk
            pricing with 3–5 day fulfillment. Zero platform fees.
          </p>

          {/* Trust metric */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#c8aa6e] opacity-60" />
            <span className="text-sm text-[#9ca3af] tracking-wide">
              Trusted by 300+ retailers nationwide
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex gap-4 flex-wrap">
            <Button
              size="lg"
              asChild
              className="bg-[#c8aa6e] text-[#0f1a24] hover:bg-[#d4ba82] font-bold tracking-wide uppercase text-sm px-8"
            >
              <Link href={`${basePath}/products`}>Shop Wholesale</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-[#c8aa6e]/30 text-[#c8aa6e] hover:bg-[#c8aa6e]/10 font-semibold tracking-wide uppercase text-sm px-8"
            >
              <Link href={`${basePath}/wholesale`}>Get Bulk Pricing</Link>
            </Button>
          </div>

          {/* Value props row */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-[#c8aa6e]/10 pt-8">
            <div>
              <p className="text-[#c8aa6e] text-2xl font-bold">50+</p>
              <p className="text-sm text-[#9ca3af] mt-1">Minimum Order Units</p>
            </div>
            <div>
              <p className="text-[#c8aa6e] text-2xl font-bold">3–5 Days</p>
              <p className="text-sm text-[#9ca3af] mt-1">
                Fulfillment Guarantee
              </p>
            </div>
            <div>
              <p className="text-[#c8aa6e] text-2xl font-bold">Net-30</p>
              <p className="text-sm text-[#9ca3af] mt-1">
                Payment Terms Available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8aa6e] to-transparent opacity-20" />
    </section>
  );
}
