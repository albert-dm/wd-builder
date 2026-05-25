/**
 * Server-only helper functions for tarot operations.
 * This file should only be imported dynamically inside createServerFn handlers.
 */

import {
  getAllTarotCards,
  getTarotCardById,
  type TarotCard,
} from "@webdrops/tarot-core";
import {
  dailyReadingEntitlements,
  pixPayments,
  readingMessages,
  readingSessions,
  readings,
} from "@webdrops/tarot-db";
import { and, desc, eq } from "drizzle-orm";
import { formatCardForTool } from "./agent.server";
import { getDb } from "./db.server";

const SAO_PAULO_TZ = "America/Sao_Paulo";

export function nowSaoPauloRfc3339(): string {
  return `${new Date()
    .toLocaleString("sv-SE", { timeZone: SAO_PAULO_TZ })
    .replace(" ", "T")}-03:00`;
}

function todaySaoPauloString(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: SAO_PAULO_TZ });
}

function isSameSaoPauloDay(left: Date | null, right: Date | null): boolean {
  if (!left || !right) return false;
  const leftStr = left.toLocaleDateString("sv-SE", { timeZone: SAO_PAULO_TZ });
  const rightStr = right.toLocaleDateString("sv-SE", {
    timeZone: SAO_PAULO_TZ,
  });
  return leftStr === rightStr;
}

function drawRandomCard(): TarotCard {
  const deck = getAllTarotCards();
  const index = Math.floor(Math.random() * deck.length);
  return deck[index];
}

function formatCurrencyCents(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export async function getOrCreateSession(userId: string) {
  const db = getDb();

  const existing = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const now = new Date();
  const inserted = await db
    .insert(readingSessions)
    .values({
      userId,
      lastResetAt: now,
    })
    .returning();

  return inserted[0];
}

export async function refreshDailyIfNeeded(
  session: typeof readingSessions.$inferSelect,
) {
  const db = getDb();
  const now = new Date();

  if (isSameSaoPauloDay(session.lastResetAt, now)) {
    return session;
  }

  await db
    .update(readingSessions)
    .set({
      cardsRemainingToday: 1,
      lastResetAt: now,
      updatedAt: now,
    })
    .where(eq(readingSessions.id, session.id));

  const refreshed = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.id, session.id))
    .limit(1);

  return refreshed[0];
}

async function getTodayEntitlement(userId: string) {
  const db = getDb();
  const today = todaySaoPauloString();

  const existing = await db
    .select()
    .from(dailyReadingEntitlements)
    .where(
      and(
        eq(dailyReadingEntitlements.userId, userId),
        eq(dailyReadingEntitlements.readingDate, today),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const inserted = await db
    .insert(dailyReadingEntitlements)
    .values({
      userId,
      readingDate: today,
      cardsGranted: 1,
      cardsConsumed: 0,
    })
    .returning();

  return inserted[0];
}

export async function getLatestReading(sessionId: string) {
  const db = getDb();

  const result = await db
    .select()
    .from(readings)
    .where(eq(readings.sessionId, sessionId))
    .orderBy(desc(readings.revealedAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getChatHistory(sessionId: string) {
  const db = getDb();

  const messages = await db
    .select()
    .from(readingMessages)
    .where(eq(readingMessages.sessionId, sessionId))
    .orderBy(readingMessages.createdAt);

  return messages.map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: m.createdAt?.toISOString() ?? "",
  }));
}

export async function appendChatMessage(
  sessionId: string,
  role: "User" | "Assistant" | "System" | "Tool",
  content: string,
  metadata?: Record<string, unknown> | null,
) {
  const db = getDb();

  await db.insert(readingMessages).values({
    sessionId,
    role,
    content,
    metadata,
  });
}

export interface DrawCardResult {
  status: "revelada_gratis" | "revelada_extra" | "ja_revelada";
  origem: string;
  restantes_hoje: number;
  cartas_extras_disponiveis: number;
  data: string;
  carta: Record<string, unknown>;
}

async function drawAvailableCard(userId: string): Promise<DrawCardResult> {
  const db = getDb();
  let session = await getOrCreateSession(userId);
  session = await refreshDailyIfNeeded(session);

  // Check if we already drew today's free card
  const latestReading = await getLatestReading(session.id);
  const today = todaySaoPauloString();

  if (latestReading && latestReading.revealedAt) {
    const readingDate = latestReading.revealedAt.toLocaleDateString("sv-SE", {
      timeZone: SAO_PAULO_TZ,
    });

    if (readingDate === today) {
      // Already drew today's free card
      if (session.purchasedCardsAvailable <= 0) {
        const card = getTarotCardById(latestReading.cardId);
        return {
          status: "ja_revelada",
          origem: "gratis_diaria",
          restantes_hoje: 0,
          cartas_extras_disponiveis: session.purchasedCardsAvailable,
          data: today,
          carta: card ? formatCardForTool(card) : {},
        };
      }

      // Use purchased extra card
      const card = drawRandomCard();
      const now = new Date();

      // Decrement purchased cards
      await db
        .update(readingSessions)
        .set({
          purchasedCardsAvailable: session.purchasedCardsAvailable - 1,
          updatedAt: now,
        })
        .where(eq(readingSessions.id, session.id));

      // Create reading record
      const readingId = crypto.randomUUID();
      await db.insert(readings).values({
        id: readingId,
        sessionId: session.id,
        userId,
        cardId: card.id,
        source: "PurchasedExtra",
        revealedAt: now,
      });

      // Update session current reading
      await db
        .update(readingSessions)
        .set({ currentReadingId: readingId, updatedAt: now })
        .where(eq(readingSessions.id, session.id));

      return {
        status: "revelada_extra",
        origem: "carta_extra_comprada",
        restantes_hoje: 0,
        cartas_extras_disponiveis: session.purchasedCardsAvailable - 1,
        data: today,
        carta: formatCardForTool(card),
      };
    }
  }

  // Draw daily free card
  const card = drawRandomCard();
  const entitlement = await getTodayEntitlement(userId);
  const now = new Date();

  // Create reading record
  const readingId = crypto.randomUUID();
  await db.insert(readings).values({
    id: readingId,
    sessionId: session.id,
    userId,
    cardId: card.id,
    source: "DailyFree",
    entitlementId: entitlement.id,
    revealedAt: now,
  });

  // Consume daily entitlement
  await db
    .update(dailyReadingEntitlements)
    .set({ cardsConsumed: entitlement.cardsConsumed + 1, updatedAt: now })
    .where(eq(dailyReadingEntitlements.id, entitlement.id));

  // Update session
  await db
    .update(readingSessions)
    .set({
      cardsRemainingToday: 0,
      currentReadingId: readingId,
      updatedAt: now,
    })
    .where(eq(readingSessions.id, session.id));

  return {
    status: "revelada_gratis",
    origem: "gratis_diaria",
    restantes_hoje: 0,
    cartas_extras_disponiveis: session.purchasedCardsAvailable,
    data: today,
    carta: formatCardForTool(card),
  };
}

/**
 * Tool handlers for the AI agent
 */
export const toolHandlers = {
  sortearCarta: async (userId: string) => {
    return drawAvailableCard(userId);
  },

  gerarPix: async (userId: string) => {
    const db = getDb();
    const session = await getOrCreateSession(userId);
    const now = new Date();

    // If already has extra cards
    if (session.purchasedCardsAvailable > 0) {
      return {
        status: "carta_extra_ja_disponivel",
        cartas_extras_disponiveis: session.purchasedCardsAvailable,
        pagamentos_pendentes: 0,
        pagamento: null,
      };
    }

    // Check for existing pending purchase
    const pendingPurchases = await db
      .select()
      .from(pixPayments)
      .where(
        and(eq(pixPayments.userId, userId), eq(pixPayments.status, "pending")),
      )
      .orderBy(desc(pixPayments.createdAt))
      .limit(1);

    if (pendingPurchases.length > 0) {
      const purchase = pendingPurchases[0];
      return {
        status: "pix_pendente_existente",
        cartas_extras_disponiveis: session.purchasedCardsAvailable,
        pagamentos_pendentes: pendingPurchases.length,
        pagamento: {
          pix_id: purchase.externalPaymentId,
          valor_centavos: purchase.amountCents,
          valor_formatado: formatCurrencyCents(purchase.amountCents),
          cartas_liberadas: purchase.itemQuantity,
          status_pagamento: purchase.status,
          expira_em: purchase.expiresAt?.toISOString() ?? "",
          pix_copia_cola: purchase.pixCode,
          qr_code_base64: purchase.qrCodeBase64,
        },
      };
    }

    // Create new PIX via AbacatePay
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) throw new Error("ABACATEPAY_API_KEY must be set");

    const pixExpires = parseInt(
      process.env.ABACATEPAY_PIX_EXPIRES_IN_SECONDS ?? "1800",
      10,
    );

    const response = await fetch(
      "https://api.abacatepay.com/v2/transparents/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "PIX",
          data: {
            amount: 500,
            expiresIn: pixExpires,
            description: "Guia da Roda extra",
            metadata: { userId, purpose: "guia_da_roda_extra_card" },
          },
        }),
      },
    );

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`AbacatePay error (${response.status}): ${body}`);
    }

    const parsed = JSON.parse(body);
    if (!parsed.data) {
      throw new Error("AbacatePay returned no data");
    }

    const qrCode = parsed.data;

    // Save to DB
    await db.insert(pixPayments).values({
      userId,
      gateway: "abacatepay",
      externalPaymentId: qrCode.id,
      amountCents: qrCode.amount,
      itemQuantity: 1,
      status: "pending",
      pixCode: qrCode.brCode,
      qrCodeBase64: qrCode.brCodeBase64,
      expiresAt: qrCode.expiresAt ? new Date(qrCode.expiresAt) : now,
    });

    const pendingCount = await db
      .select()
      .from(pixPayments)
      .where(
        and(eq(pixPayments.userId, userId), eq(pixPayments.status, "pending")),
      );

    return {
      status: "pix_gerado",
      cartas_extras_disponiveis: session.purchasedCardsAvailable,
      pagamentos_pendentes: pendingCount.length,
      pagamento: {
        pix_id: qrCode.id,
        valor_centavos: qrCode.amount,
        valor_formatado: formatCurrencyCents(qrCode.amount),
        cartas_liberadas: 1,
        status_pagamento: "pending",
        expira_em: qrCode.expiresAt ?? "",
        pix_copia_cola: qrCode.brCode,
        qr_code_base64: qrCode.brCodeBase64,
      },
    };
  },

  verificarPix: async (userId: string) => {
    const db = getDb();
    const session = await getOrCreateSession(userId);

    // Get latest purchase (pending or recently paid)
    const purchases = await db
      .select()
      .from(pixPayments)
      .where(
        and(
          eq(pixPayments.userId, userId),
          // Check for pending OR recently paid (within last 5 minutes)
        ),
      )
      .orderBy(desc(pixPayments.createdAt))
      .limit(1);

    if (purchases.length === 0) {
      return {
        status: "sem_pagamento_registrado",
        credito_liberado_agora: false,
        cartas_extras_disponiveis: session.purchasedCardsAvailable,
        pagamentos_pendentes: 0,
        pagamento: null,
      };
    }

    const purchase = purchases[0];

    // If already paid and credited, return success
    if (purchase.status === "paid" && purchase.creditedAt) {
      const refreshedSession = await getOrCreateSession(userId);
      return {
        status: "pagamento_ja_confirmado",
        credito_liberado_agora: false,
        cartas_extras_disponiveis: refreshedSession.purchasedCardsAvailable,
        pagamentos_pendentes: 0,
        pagamento: {
          pix_id: purchase.externalPaymentId,
          valor_centavos: purchase.amountCents,
          valor_formatado: formatCurrencyCents(purchase.amountCents),
          cartas_liberadas: purchase.itemQuantity,
          status_pagamento: "paid",
          pix_copia_cola: purchase.pixCode,
          qr_code_base64: purchase.qrCodeBase64,
        },
      };
    }

    // If still pending, check with AbacatePay

    // Check with AbacatePay
    try {
      const apiKey = process.env.ABACATEPAY_API_KEY;
      if (!apiKey) throw new Error("ABACATEPAY_API_KEY must be set");

      const checkResponse = await fetch(
        `https://api.abacatepay.com/v2/transparents/check?id=${purchase.externalPaymentId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${apiKey}` },
        },
      );

      const checkBody = await checkResponse.text();
      if (!checkResponse.ok) {
        throw new Error(`AbacatePay check error (${checkResponse.status})`);
      }

      const checkParsed = JSON.parse(checkBody);
      if (!checkParsed.data) {
        throw new Error("No data in AbacatePay response");
      }

      const remoteStatus = checkParsed.data;
      const normalizedStatus = remoteStatus.status?.trim().toUpperCase();
      const now = new Date();

      // Update local status
      let status: "pending" | "paid" | "expired" | "cancelled" | "refunded" =
        "pending";
      if (["PAID", "APPROVED", "REDEEMED"].includes(normalizedStatus)) {
        status = "paid";
      } else if (normalizedStatus === "EXPIRED") {
        status = "expired";
      } else if (normalizedStatus === "CANCELLED") {
        status = "cancelled";
      }

      await db
        .update(pixPayments)
        .set({
          status,
          expiresAt: remoteStatus.expiresAt
            ? new Date(remoteStatus.expiresAt)
            : purchase.expiresAt,
          paidAt: status === "paid" ? now : purchase.paidAt,
          updatedAt: now,
        })
        .where(eq(pixPayments.id, purchase.id));

      // If paid, credit the card
      let creditedNow = false;
      if (status === "paid" && !purchase.creditedAt) {
        await db
          .update(pixPayments)
          .set({ creditedAt: now, updatedAt: now })
          .where(eq(pixPayments.id, purchase.id));

        // Refresh session
        let freshSession = await getOrCreateSession(userId);
        freshSession = await refreshDailyIfNeeded(freshSession);

        await db
          .update(readingSessions)
          .set({
            purchasedCardsAvailable:
              freshSession.purchasedCardsAvailable + purchase.itemQuantity,
            updatedAt: now,
          })
          .where(eq(readingSessions.userId, userId));

        creditedNow = true;
      }

      // Get updated session
      const updatedSession = await getOrCreateSession(userId);
      const pendingCount = await db
        .select()
        .from(pixPayments)
        .where(
          and(
            eq(pixPayments.userId, userId),
            eq(pixPayments.status, "pending"),
          ),
        );

      let statusLabel: string;
      if (status === "paid" && creditedNow) {
        statusLabel = "pago_creditado_agora";
      } else if (status === "paid") {
        statusLabel = "pago_creditado";
      } else {
        statusLabel = `pagamento_${status}`;
      }

      return {
        status: statusLabel,
        credito_liberado_agora: creditedNow,
        cartas_extras_disponiveis: updatedSession.purchasedCardsAvailable,
        pagamentos_pendentes: pendingCount.length,
        pagamento: {
          pix_id: purchase.externalPaymentId,
          valor_centavos: purchase.amountCents,
          valor_formatado: formatCurrencyCents(purchase.amountCents),
          cartas_liberadas: purchase.itemQuantity,
          status_pagamento: status,
          expira_em: purchase.expiresAt?.toISOString() ?? "",
          pix_copia_cola: purchase.pixCode,
          qr_code_base64: purchase.qrCodeBase64,
        },
      };
    } catch {
      // If check fails, return current local state
      return {
        status: "pagamento_pendente",
        credito_liberado_agora: false,
        cartas_extras_disponiveis: session.purchasedCardsAvailable,
        pagamentos_pendentes: 1,
        pagamento: {
          pix_id: purchase.externalPaymentId,
          valor_centavos: purchase.amountCents,
          valor_formatado: formatCurrencyCents(purchase.amountCents),
          cartas_liberadas: purchase.itemQuantity,
          status_pagamento: purchase.status,
          expira_em: purchase.expiresAt?.toISOString() ?? "",
          pix_copia_cola: purchase.pixCode,
          qr_code_base64: purchase.qrCodeBase64,
        },
      };
    }
  },
};

/**
 * Build the session state response for the client
 */
export function buildSessionResponse(
  userId: string,
  userName: string,
  session: typeof readingSessions.$inferSelect,
  pendingPaymentCount: number,
  currentReading: {
    cardId: string;
    revealedAt: string;
    source: "DailyFree" | "PurchasedExtra";
    card: TarotCard | undefined;
  } | null,
  chatHistory: {
    role: "User" | "Assistant" | "System" | "Tool";
    content: string;
    timestamp: string;
  }[],
) {
  return {
    userId,
    userName,
    spread: "SingleCard" as const,
    cardsRemainingToday: session.cardsRemainingToday,
    purchasedCardsAvailable: session.purchasedCardsAvailable,
    pendingPaymentCount,
    lastResetAt: session.lastResetAt?.toISOString() ?? "",
    currentReading,
    chatHistory,
  };
}

export { getTarotCardById };
