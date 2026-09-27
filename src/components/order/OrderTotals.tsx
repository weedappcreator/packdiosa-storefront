import type { Cart, Order } from "@spree/sdk";
import { useTranslations } from "next-intl";

type OrderLike = Cart | Order;

interface OrderTotalsProps {
  order: OrderLike;
}

export function OrderTotals({ order }: OrderTotalsProps) {
  const t = useTranslations("common");

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[#9ca3af]">{t("subtotal")}</span>
        <span className="text-[#faf9f7]">{order.display_item_total}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-[#9ca3af]">{t("shipping")}</span>
        <span className="text-[#faf9f7]">{order.display_delivery_total}</span>
      </div>

      {order.discount_total &&
        Number.parseFloat(order.discount_total) !== 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#9ca3af]">{t("discount")}</span>
            <span className="text-green-600">
              {order.display_discount_total}
            </span>
          </div>
        )}

      {Number.parseFloat(order.tax_total ?? "0") > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-[#9ca3af]">{t("tax")}</span>
          <span className="text-[#faf9f7]">{order.display_tax_total}</span>
        </div>
      )}

      <div className="flex justify-between pt-2 border-t border-[#c8aa6e]/15">
        <span className="font-semibold text-[#faf9f7]">{t("total")}</span>
        <span className="font-semibold text-[#faf9f7]">
          {order.display_total}
        </span>
      </div>

      {order.gift_card &&
      Number.parseFloat(order.gift_card_total ?? "0") > 0 ? (
        <div className="flex justify-between text-sm">
          <span className="text-[#9ca3af]">{t("giftCard")}</span>
          <span className="text-green-600">
            -{order.display_gift_card_total}
          </span>
        </div>
      ) : order.store_credit_total &&
        Number.parseFloat(order.store_credit_total) > 0 ? (
        <div className="flex justify-between text-sm">
          <span className="text-[#9ca3af]">{t("storeCredit")}</span>
          <span className="text-green-600">
            -{order.display_store_credit_total}
          </span>
        </div>
      ) : null}

      {Number.parseFloat(order.amount_due ?? "0") > 0 &&
        order.amount_due !== order.total && (
          <div className="flex justify-between pt-2 border-t border-[#c8aa6e]/15">
            <span className="font-semibold text-[#faf9f7]">
              {t("amountDue")}
            </span>
            <span className="font-semibold text-[#faf9f7]">
              {order.display_amount_due}
            </span>
          </div>
        )}
    </div>
  );
}
