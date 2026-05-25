/**
 * Tarot server functions for Guia da Roda.
 * Session management, card draws, and chat with AI agent.
 *
 * IMPORTANT: This file uses dynamic imports inside createServerFn handlers
 * to avoid pulling server-only code into the client bundle.
 */

import { createServerFn } from "@tanstack/react-start";

export const ensureTarotSession = createServerFn({ method: "GET" }).handler(
  async () => {
    // Dynamic import to avoid client bundle contamination
    const {
      getOrCreateSession,
      refreshDailyIfNeeded,
      getChatHistory,
      getLatestReading,
      appendChatMessage,
      nowSaoPauloRfc3339,
      getTarotCardById,
      buildSessionResponse,
    } = await import("./tarot-helpers.server");
    const { requireAuthenticatedUser } = await import("./auth");
    const { getDb } = await import("./db.server");
    const { pixPayments } = await import("@webdrops/tarot-db");
    const { and, eq } = await import("drizzle-orm");

    const authUser = await requireAuthenticatedUser();
    if (!authUser.displayName) {
      throw new Error(
        "Complete o seu perfil antes de iniciar a leitura de tarot",
      );
    }

    let session = await getOrCreateSession(authUser.id);
    session = await refreshDailyIfNeeded(session);

    const chatHistory = await getChatHistory(session.id);
    const latestReading = await getLatestReading(session.id);

    let currentReading = null;
    if (latestReading) {
      const card = getTarotCardById(latestReading.cardId);
      currentReading = {
        cardId: latestReading.cardId,
        revealedAt: latestReading.revealedAt?.toISOString() ?? "",
        source: latestReading.source,
        card,
      };
    }

    const pendingPayments = await getDb()
      .select()
      .from(pixPayments)
      .where(
        and(
          eq(pixPayments.userId, authUser.id),
          eq(pixPayments.status, "pending"),
        ),
      );

    // If no intro message yet, add one
    if (chatHistory.length === 0) {
      const introContent = `Bem-vindo ao circulo, ${authUser.displayName}. Aqui o taro e tratado como espelho do presente, nao como destino fixo. Cada consulente recebe uma carta gratuita por dia, renovada a meia-noite no horario de Sao Paulo. Se quiser ir alem disso no mesmo dia, pode comprar cartas extras por PIX quando fizer sentido. Traga um tema ou pergunta, e quando chegar a hora, a carta sera revelada com calma.`;

      await appendChatMessage(session.id, "Assistant", introContent);
      chatHistory.push({
        role: "Assistant" as const,
        content: introContent,
        timestamp: nowSaoPauloRfc3339(),
      });
    }

    return buildSessionResponse(
      authUser.id,
      authUser.displayName,
      session,
      pendingPayments.length,
      currentReading,
      chatHistory,
    );
  },
);

export const loadTarotDashboard = createServerFn({ method: "GET" }).handler(
  async () => {
    // Dynamic import to avoid client bundle contamination
    const {
      getOrCreateSession,
      refreshDailyIfNeeded,
      getLatestReading,
      getChatHistory,
      getTarotCardById,
    } = await import("./tarot-helpers.server");
    const { requireAuthenticatedUser } = await import("./auth");
    const { getDb } = await import("./db.server");
    const { pixPayments } = await import("@webdrops/tarot-db");
    const { eq, desc, and } = await import("drizzle-orm");

    const authUser = await requireAuthenticatedUser();
    if (!authUser.displayName) {
      throw new Error("Complete o seu perfil antes de acessar a carteira");
    }

    let session = await getOrCreateSession(authUser.id);
    session = await refreshDailyIfNeeded(session);

    const recentPurchases = await getDb()
      .select()
      .from(pixPayments)
      .where(eq(pixPayments.userId, authUser.id))
      .orderBy(desc(pixPayments.createdAt))
      .limit(8);

    const pendingPayments = await getDb()
      .select()
      .from(pixPayments)
      .where(
        and(
          eq(pixPayments.userId, authUser.id),
          eq(pixPayments.status, "pending"),
        ),
      );

    const latestReading = await getLatestReading(session.id);
    let currentReading = null;
    if (latestReading) {
      const card = getTarotCardById(latestReading.cardId);
      currentReading = {
        cardId: latestReading.cardId,
        revealedAt: latestReading.revealedAt?.toISOString() ?? "",
        source: latestReading.source,
        card,
      };
    }

    return {
      session: {
        userId: authUser.id,
        userName: authUser.displayName,
        spread: "SingleCard" as const,
        cardsRemainingToday: session.cardsRemainingToday,
        purchasedCardsAvailable: session.purchasedCardsAvailable,
        pendingPaymentCount: pendingPayments.length,
        lastResetAt: session.lastResetAt?.toISOString() ?? "",
        currentReading,
        chatHistory: await getChatHistory(session.id),
      },
      recentPurchases: recentPurchases.map((p) => ({
        pixId: p.externalPaymentId,
        amountCents: p.amountCents,
        cardQuantity: p.itemQuantity,
        status: p.status,
        brCode: p.pixCode,
        brCodeBase64: p.qrCodeBase64,
        expiresAt: p.expiresAt?.toISOString() ?? "",
        createdAt: p.createdAt?.toISOString() ?? "",
        updatedAt: p.updatedAt?.toISOString() ?? "",
        paidAt: p.paidAt?.toISOString() ?? null,
        creditedAt: p.creditedAt?.toISOString() ?? null,
      })),
    };
  },
);

export const streamTarotMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string }) => data)
  .handler(async ({ data }) => {
    const {
      getOrCreateSession,
      getChatHistory,
      appendChatMessage,
      toolHandlers,
    } = await import("./tarot-helpers.server");
    const { runChatTurnStream } = await import("./agent.server");
    const { requireAuthenticatedUser } = await import("./auth");

    const message = data.message?.trim();
    if (!message) throw new Error("Empty messages are not allowed");

    const authUser = await requireAuthenticatedUser();
    if (!authUser.displayName) {
      throw new Error(
        "Complete o seu perfil antes de iniciar a leitura de tarot",
      );
    }

    const session = await getOrCreateSession(authUser.id);
    const chatHistory = await getChatHistory(session.id);

    await appendChatMessage(session.id, "User", message);

    // Collect streaming response
    let fullResponse = "";
    let toolExecution: { toolName: string; rawOutput: string } | undefined;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of runChatTurnStream(
            message,
            authUser.id,
            chatHistory,
            toolHandlers,
          )) {
            if (chunk.content) {
              fullResponse += chunk.content;
              controller.enqueue(encoder.encode(chunk.content));
            }
            if (chunk.done && chunk.toolExecution) {
              toolExecution = chunk.toolExecution;
            }
          }

          // Save the AI response first
          await appendChatMessage(session.id, "Assistant", fullResponse);

          // Save tool execution after AI message (so it appears after in chat)
          if (toolExecution) {
            const toolMessage = `Tool:${toolExecution.toolName} ->\n${toolExecution.rawOutput}`;
            await appendChatMessage(session.id, "Tool", toolMessage, {
              toolName: toolExecution.toolName,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(encoder.encode(`\n[ERROR]${errorMessage}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  });
