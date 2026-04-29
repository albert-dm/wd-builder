import { describe, expect, test } from "vitest";
import {
  createReadingSession,
  getCurrentTarotCard,
  getTotalCardsAvailable,
} from "./reading-session";
import { getTarotCardById } from "./tarot-deck";

describe("reading session", () => {
  test("creates a session with the single-card daily defaults", () => {
    const session = createReadingSession({
      userId: "user-1",
      userName: "Guia",
      now: "2026-04-27T23:00:00.000Z",
    });

    expect(session.spread).toBe("SingleCard");
    expect(session.cardsRemainingToday).toBe(1);
    expect(session.purchasedCardsAvailable).toBe(0);
    expect(session.pendingPaymentCount).toBe(0);
    expect(session.chatHistory).toEqual([]);
  });

  test("computes the total available cards", () => {
    const session = createReadingSession({
      userId: "user-1",
      userName: "Guia",
      now: "2026-04-27T23:00:00.000Z",
    });

    session.purchasedCardsAvailable = 2;

    expect(getTotalCardsAvailable(session)).toBe(3);
  });

  test("resolves the current card through the provided deck lookup", () => {
    const session = createReadingSession({
      userId: "user-1",
      userName: "Guia",
      now: "2026-04-27T23:00:00.000Z",
    });

    session.currentReading = {
      cardId: "o-louco",
      revealedAt: "2026-04-27T23:00:00.000Z",
      source: "DailyFree",
    };

    expect(getCurrentTarotCard(session, getTarotCardById)?.slug).toBe(
      "o-louco",
    );
  });
});
