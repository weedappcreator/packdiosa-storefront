import { CreditCard, Lock } from "lucide-react";
import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { CreditCardList } from "@/components/account/CreditCardList";
import { getCreditCards } from "@/lib/data/credit-cards";

interface CreditCardsPageProps {
  params: Promise<{ country: string; locale: string }>;
}

export default async function CreditCardsPage({
  params,
}: CreditCardsPageProps) {
  await connection();
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "creditCards",
  });
  const response = await getCreditCards();
  const cards = response.data;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#faf9f7] mb-6">
        {t("paymentMethods")}
      </h1>

      {cards.length === 0 ? (
        <div className="bg-[#0f1a24] rounded-xl border border-[#c8aa6e]/15 p-12 text-center">
          <CreditCard className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#faf9f7] mb-2">
            {t("noCards")}
          </h3>
          <p className="text-[#9ca3af]">{t("noCardsDescription")}</p>
        </div>
      ) : (
        <CreditCardList initialCards={cards} />
      )}

      <div className="mt-6 p-4 bg-[#0f1a24] rounded-xl">
        <p className="text-sm text-[#9ca3af]">
          <Lock className="w-4 h-4 inline mr-1" />
          {t("secureInfo")}
        </p>
      </div>
    </div>
  );
}
