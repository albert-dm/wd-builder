import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const chatRoleEnum = pgEnum("chat_role", [
  "User",
  "Assistant",
  "System",
  "Tool",
]);
export const readingSpreadEnum = pgEnum("reading_spread", ["SingleCard"]);
export const readingSourceEnum = pgEnum("reading_source", [
  "DailyFree",
  "PurchasedExtra",
]);
export const tarotArcanaEnum = pgEnum("tarot_arcana", ["Major", "Minor"]);
export const tarotSuitEnum = pgEnum("tarot_suit", [
  "Ouros",
  "Espadas",
  "Copas",
  "Paus",
]);
export const paymentGatewayEnum = pgEnum("payment_gateway", [
  "abacatepay",
  "manual",
  "sandbox",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "expired",
  "cancelled",
  "refunded",
]);
export const eventTypeEnum = pgEnum("reading_event_type", [
  "session_created",
  "message_appended",
  "card_drawn",
  "pix_generated",
  "pix_verified",
  "payment_credited",
  "reflection_saved",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  normalizedEmail: varchar("normalized_email", { length: 320 })
    .notNull()
    .unique(),
  displayName: varchar("display_name", { length: 120 }),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const magicLinkTokens = pgTable("auth_magic_link_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  normalizedEmail: varchar("normalized_email", { length: 320 }).notNull(),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionHash: varchar("session_hash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tarotCards = pgTable("tarot_cards", {
  id: varchar("id", { length: 120 }).primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  arcana: tarotArcanaEnum("arcana").notNull(),
  suit: tarotSuitEnum("suit"),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  reversedKeywords: jsonb("reversed_keywords").$type<string[]>().notNull(),
  visualDescription: text("visual_description").notNull(),
  detailedDescription: text("detailed_description").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const readingSessions = pgTable(
  "reading_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spread: readingSpreadEnum("spread").notNull().default("SingleCard"),
    cardsRemainingToday: integer("cards_remaining_today").notNull().default(1),
    purchasedCardsAvailable: integer("purchased_cards_available")
      .notNull()
      .default(0),
    pendingPaymentCount: integer("pending_payment_count").notNull().default(0),
    lastResetAt: timestamp("last_reset_at", { withTimezone: true }).notNull(),
    currentReadingId: uuid("current_reading_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("reading_sessions_user_id_idx").on(table.userId)],
);

export const readingMessages = pgTable(
  "reading_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readingSessions.id, { onDelete: "cascade" }),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown> | null>()
      .default(null),
    embedding: vector("embedding", { dimensions: 1536 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("reading_messages_session_id_idx").on(table.sessionId)],
);

export const dailyReadingEntitlements = pgTable(
  "daily_reading_entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readingDate: varchar("reading_date", { length: 10 }).notNull(),
    cardsGranted: integer("cards_granted").notNull().default(1),
    cardsConsumed: integer("cards_consumed").notNull().default(0),
    timezone: varchar("timezone", { length: 64 })
      .notNull()
      .default("America/Sao_Paulo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("daily_reading_entitlements_user_date_idx").on(
      table.userId,
      table.readingDate,
    ),
  ],
);

export const readings = pgTable(
  "readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readingSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: varchar("card_id", { length: 120 })
      .notNull()
      .references(() => tarotCards.id),
    source: readingSourceEnum("source").notNull(),
    entitlementId: uuid("entitlement_id").references(
      () => dailyReadingEntitlements.id,
      { onDelete: "set null" },
    ),
    revealedAt: timestamp("revealed_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("readings_session_revealed_at_idx").on(
      table.sessionId,
      table.revealedAt,
    ),
  ],
);

export const pixPayments = pgTable(
  "pix_payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gateway: paymentGatewayEnum("gateway").notNull(),
    externalPaymentId: varchar("external_payment_id", { length: 255 })
      .notNull()
      .unique(),
    amountCents: integer("amount_cents").notNull(),
    itemQuantity: integer("item_quantity").notNull().default(1),
    status: paymentStatusEnum("status").notNull().default("pending"),
    pixCode: text("pix_code").notNull(),
    qrCodeBase64: text("qr_code_base64").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    creditedAt: timestamp("credited_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("pix_payments_user_status_idx").on(table.userId, table.status),
  ],
);

export const paymentWebhooks = pgTable("payment_webhooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  gateway: paymentGatewayEnum("gateway").notNull(),
  externalEventId: varchar("external_event_id", { length: 255 }),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  processed: boolean("processed").notNull().default(false),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const reflections = pgTable("reading_reflections", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => readingSessions.id, { onDelete: "cascade" }),
  readingId: uuid("reading_id").references(() => readings.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userThemes = pgTable(
  "user_themes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    theme: varchar("theme", { length: 120 }).notNull(),
    confidence: integer("confidence").notNull().default(0),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.theme] })],
);

export const readingEvents = pgTable(
  "reading_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => readingSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: eventTypeEnum("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reading_events_session_created_at_idx").on(
      table.sessionId,
      table.createdAt,
    ),
  ],
);
