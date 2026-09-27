"use client";

import Link from "next/link";
import { MagnetButton } from "@/components/animations/MagnetButton";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SpotlightCard } from "@/components/animations/SpotlightCard";

const tiers = [
  {
    name: "Starter",
    units: "50–99",
    discount: "Wholesale Price",
    features: ["Standard fulfillment", "Email support", "Credit card payment"],
    cta: "Start Ordering",
    highlighted: false,
  },
  {
    name: "Growth",
    units: "100–499",
    discount: "10% Off Wholesale",
    features: [
      "Priority fulfillment",
      "Dedicated account rep",
      "Net-30 terms",
      "Free POS materials",
    ],
    cta: "Most Popular",
    highlighted: true,
  },
  {
    name: "Enterprise",
    units: "500+",
    discount: "Custom Pricing",
    features: [
      "Express 2-day fulfillment",
      "Account manager",
      "Net-60 terms",
      "Exclusive early access",
      "Custom packaging",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

interface PricingLadderProps {
  basePath: string;
}

export function PricingLadder({ basePath }: PricingLadderProps) {
  return (
    <section className="bg-[#1a2b3c] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-[#c8aa6e] text-sm font-semibold tracking-[0.2em] uppercase text-center mb-3">
            Volume Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#faf9f7] text-center mb-4">
            Bulk Pricing Tiers
          </h2>
          <p className="text-[#9ca3af] text-center max-w-lg mx-auto mb-12">
            The more you order, the more you save. All tiers include free
            shipping on orders over $500.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <ScrollReveal key={tier.name} delay={i * 0.12}>
              <SpotlightCard
                className={`p-6 h-full flex flex-col ${
                  tier.highlighted
                    ? "border-[#c8aa6e]/40 ring-1 ring-[#c8aa6e]/20"
                    : ""
                }`}
              >
                {tier.highlighted && (
                  <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase bg-[#c8aa6e] text-[#0f1a24] px-3 py-1 rounded-full mb-4 self-start">
                    Best Value
                  </span>
                )}
                <h3 className="text-[#faf9f7] font-bold text-lg">
                  {tier.name}
                </h3>
                <p className="text-[#c8aa6e] text-2xl font-extrabold mt-2">
                  {tier.units}
                </p>
                <p className="text-[#9ca3af] text-xs uppercase tracking-wide">
                  units per order
                </p>
                <p className="text-[#faf9f7] font-semibold mt-3 text-sm">
                  {tier.discount}
                </p>

                <ul className="mt-5 space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[#9ca3af]"
                    >
                      <span className="text-[#c8aa6e] mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <MagnetButton className="mt-6">
                  <Link
                    href={
                      tier.highlighted
                        ? `${basePath}/wholesale`
                        : `${basePath}/wholesale/apply`
                    }
                    className={`block text-center py-3 px-6 rounded-md text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
                      tier.highlighted
                        ? "bg-[#c8aa6e] text-[#0f1a24] hover:bg-[#d4ba82]"
                        : "border border-[#c8aa6e]/30 text-[#c8aa6e] hover:bg-[#c8aa6e]/10"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </MagnetButton>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
