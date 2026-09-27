"use client";

import { Clock, Package, Shield, Truck } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SpotlightCard } from "@/components/animations/SpotlightCard";

const signals = [
  {
    icon: Truck,
    title: "3–5 Day Fulfillment",
    description:
      "Orders placed by Wednesday ship by Friday. Reliable logistics off I-95.",
  },
  {
    icon: Package,
    title: "50+ Unit MOQ",
    description:
      "Low minimums for independent retailers. Volume discounts at 100+ and 500+ tiers.",
  },
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description:
      "Every product inspected before shipping. 30-day return policy on unsold inventory.",
  },
  {
    icon: Clock,
    title: "Net-30 Terms",
    description:
      "Flexible payment options — credit card, ACH, or Net-30/60 for approved accounts.",
  },
];

export function TrustSignals() {
  return (
    <section className="bg-[#0f1a24] py-16 border-t border-[#c8aa6e]/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-[#c8aa6e] text-sm font-semibold tracking-[0.2em] uppercase text-center mb-3">
            Why Retailers Choose Us
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#faf9f7] text-center mb-12">
            Built for Wholesale
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {signals.map((signal, i) => (
            <ScrollReveal key={signal.title} delay={i * 0.1}>
              <SpotlightCard className="p-6 h-full">
                <signal.icon
                  className="w-8 h-8 text-[#c8aa6e] mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-[#faf9f7] font-bold text-base mb-2">
                  {signal.title}
                </h3>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  {signal.description}
                </p>
              </SpotlightCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
