import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { POLICY_LINKS } from "@/lib/constants/policies";
import { isWholesaleEnabled } from "@/lib/spree";
import { getStoreName } from "@/lib/store";
import { CurrentYear } from "./CurrentYear";

const storeName = getStoreName();

interface FooterProps {
  basePath: string;
  locale: Locale;
  categoryLinks: ReactNode;
}

interface FooterCategoryLinksProps {
  rootCategories: Category[];
  basePath: string;
}

export function FooterCategoryLinks({
  rootCategories,
  basePath,
}: FooterCategoryLinksProps) {
  return rootCategories.map((category) => (
    <li key={category.id}>
      <Link
        href={`${basePath}/c/${category.permalink}`}
        className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
      >
        {category.name}
      </Link>
    </li>
  ));
}

export async function Footer({ basePath, locale, categoryLinks }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tp = await getTranslations({ locale, namespace: "policies" });
  const wholesaleEnabled = isWholesaleEnabled();

  return (
    <footer className="bg-[#0a1118] text-[#9ca3af] border-t border-[#c8aa6e]/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <span
                className="text-xl font-extrabold tracking-[0.08em] text-[#faf9f7] uppercase"
                style={{
                  fontFamily: "var(--font-barlow), system-ui, sans-serif",
                }}
              >
                PACK-DIOSA
              </span>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-[#c8aa6e] uppercase mt-0.5">
                LLC
              </span>
            </div>
            <p className="text-xs tracking-[0.15em] text-[#c8aa6e] uppercase mt-1">
              Nova Cargo
            </p>
            <p className="mt-4 text-sm text-[#9ca3af] max-w-sm leading-relaxed">
              Premium wholesale distribution — containers, pallets, and apparel
              for independent retailers. Off I-95, Jesup GA.
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-[#9ca3af]">
              <p>561 SW Broad St, Jesup, GA 31545</p>
              <p>Tue–Fri, 9:00 AM – 5:00 PM</p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-bold text-[#faf9f7] tracking-[0.1em] uppercase">
              {t("shop")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/products`}
                  className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                >
                  {t("allProducts")}
                </Link>
              </li>
              {categoryLinks}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-bold text-[#faf9f7] tracking-[0.1em] uppercase">
              {t("account")}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`${basePath}/account`}
                  className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                >
                  {t("myAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/account/orders`}
                  className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                >
                  {t("orderHistory")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/track`}
                  className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                >
                  {t("trackOrder")}
                </Link>
              </li>
              <li>
                <Link
                  href={`${basePath}/cart`}
                  className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                >
                  {t("cart")}
                </Link>
              </li>
              {wholesaleEnabled && (
                <li>
                  <Link
                    href={`${basePath}/wholesale`}
                    className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                  >
                    {t("wholesale")}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-sm font-bold text-[#faf9f7] tracking-[0.1em] uppercase">
              {t("policies")}
            </h3>
            <ul className="mt-4 space-y-3">
              {POLICY_LINKS.map((policy) => (
                <li key={policy.slug}>
                  <Link
                    href={`${basePath}/policies/${policy.slug}`}
                    className="text-sm text-[#9ca3af] hover:text-[#c8aa6e] transition-colors duration-200"
                  >
                    {tp(policy.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-[#c8aa6e]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#9ca3af]">
          <p>
            &copy; <CurrentYear /> {storeName}. All rights reserved.
          </p>
          <p>
            Powered by{" "}
            <Link
              href="https://spreecommerce.org"
              target="_blank"
              className="text-[#c8aa6e] hover:text-[#d4ba82] transition-colors duration-200"
            >
              Spree Commerce
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
