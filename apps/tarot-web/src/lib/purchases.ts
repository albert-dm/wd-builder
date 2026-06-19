/**
 * Shared types and formatting helpers for PIX purchases and the tarot
 * dashboard, used by the market and wallet routes.
 */

export interface Purchase {
  pixId: string;
  amountCents: number;
  cardQuantity: number;
  status: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  session: {
    cardsRemainingToday: number;
    purchasedCardsAvailable: number;
    pendingPaymentCount: number;
  };
  recentPurchases: Purchase[];
}

export function formatBrlFromCents(amountCents: number): string {
  const reais = Math.floor(amountCents / 100);
  const cents = amountCents % 100;
  return `R$ ${reais},${cents.toString().padStart(2, "0")}`;
}

const PURCHASE_STATUS_LABELS: Record<string, string> = {
  pix_gerado: "PIX gerado",
  pix_pendente_existente: "PIX pendente",
  carta_extra_ja_disponivel: "Carta extra disponivel",
  pago_creditado_agora: "Pagamento confirmado agora",
  pago_creditado: "Pagamento confirmado",
  pending: "Pagamento pendente",
  paid: "Pagamento confirmado",
  expired: "PIX expirado",
  cancelled: "PIX cancelado",
  refunded: "PIX estornado",
};

export function purchaseStatusLabel(status: string): string {
  return PURCHASE_STATUS_LABELS[status] ?? "Movimento ritual";
}

const SUCCESS_STATUSES = ["pago_creditado_agora", "pago_creditado", "paid"];
const MUTED_STATUSES = ["expired", "cancelled", "refunded"];

export function purchaseStatusClass(status: string): string {
  if (status === "pending") return "status-pill is-pending";
  if (SUCCESS_STATUSES.includes(status)) return "status-pill is-success";
  if (MUTED_STATUSES.includes(status)) return "status-pill is-muted";
  return "status-pill";
}
