import {
  type ReadingSession,
  ReadingSessionSchema,
  type TarotCard,
} from "./schemas";

export function createReadingSession(input: {
  userId: string;
  userName: string;
  now: string;
}): ReadingSession {
  return ReadingSessionSchema.parse({
    userId: input.userId,
    userName: input.userName,
    spread: "SingleCard",
    cardsRemainingToday: 1,
    purchasedCardsAvailable: 0,
    pendingPaymentCount: 0,
    lastResetAt: input.now,
    currentReading: undefined,
    chatHistory: [],
  });
}

export function getTotalCardsAvailable(session: ReadingSession): number {
  return session.cardsRemainingToday + session.purchasedCardsAvailable;
}

export function getCurrentTarotCard(
  session: ReadingSession,
  deckLookup: (cardId: string) => TarotCard | undefined,
): TarotCard | undefined {
  return session.currentReading
    ? deckLookup(session.currentReading.cardId)
    : undefined;
}
