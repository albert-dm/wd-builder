import { z } from "zod";

export const TarotArcanaSchema = z.enum(["Major", "Minor"]);
export const TarotSuitSchema = z.enum(["Ouros", "Espadas", "Copas", "Paus"]);

export const TarotCardSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  arcana: TarotArcanaSchema,
  suit: TarotSuitSchema.optional(),
  keywords: z.array(z.string()),
  reversedKeywords: z.array(z.string()),
  visualDescription: z.string().min(1),
  detailedDescription: z.string().min(1),
});

export const ChatRoleSchema = z.enum(["User", "Assistant", "System"]);

export const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z.string(),
  timestamp: z.string().min(1),
});

export const ReadingSpreadSchema = z.enum(["SingleCard"]);
export const ReadingSourceSchema = z.enum(["DailyFree", "PurchasedExtra"]);

export const CurrentReadingSchema = z.object({
  cardId: z.string().min(1),
  revealedAt: z.string().min(1),
  source: ReadingSourceSchema,
});

export const ReadingSessionSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  spread: ReadingSpreadSchema,
  cardsRemainingToday: z.number().int().min(0).max(255),
  purchasedCardsAvailable: z.number().int().min(0).max(65535),
  pendingPaymentCount: z.number().int().min(0).max(65535),
  lastResetAt: z.string().min(1),
  currentReading: CurrentReadingSchema.optional(),
  chatHistory: z.array(ChatMessageSchema),
});

export const FlowiseTarotToolExportSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  func: z.string().min(1),
});

export type TarotCard = z.infer<typeof TarotCardSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type CurrentReading = z.infer<typeof CurrentReadingSchema>;
export type ReadingSession = z.infer<typeof ReadingSessionSchema>;
export type FlowiseTarotToolExport = z.infer<
  typeof FlowiseTarotToolExportSchema
>;
