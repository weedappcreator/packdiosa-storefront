import type { Order } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  getFulfillmentStatusColor,
  getPaymentStatusColor,
} from "@/lib/utils/format";

function getStatusLabel(
  status: string | null,
  t: (key: string) => string,
): string {
  if (!status) return t("notAvailable");
  // Map API statuses like "balance_due" to translation keys like "balanceDue"
  const key = status.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  try {
    return t(key);
  } catch {
    return status.replace(/_/g, " ");
  }
}

interface OrderListProps {
  orders: Order[];
  basePath: string;
  locale: string;
}

export async function OrderList({ orders, basePath, locale }: OrderListProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "orders",
  });

  return (
    <div className="bg-[#0f1a24] rounded-xl border border-[#c8aa6e]/15 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#0f1a24]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("order")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("date")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("payment")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("shipment")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("totalColumn")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#9ca3af] uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#0f1a24] divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-[#0f1a24]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-[#faf9f7]">
                    <Button variant="link" size="sm" asChild className="p-0">
                      <Link href={`${basePath}/account/orders/${order.id}`}>
                        #{order.number}
                      </Link>
                    </Button>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#9ca3af]">
                    {formatDate(order.completed_at, "-", locale)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${getPaymentStatusColor(order.payment_status)}`}
                  >
                    {getStatusLabel(order.payment_status ?? null, t)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize ${getFulfillmentStatusColor(order.fulfillment_status)}`}
                  >
                    {getStatusLabel(order.fulfillment_status ?? null, t)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-medium text-[#faf9f7]">
                    {order.display_total}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button variant="link" size="sm" asChild>
                    <Link href={`${basePath}/account/orders/${order.id}`}>
                      {t("view")}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
