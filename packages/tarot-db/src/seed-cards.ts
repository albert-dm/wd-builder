/**
 * Seed script to populate the tarot_cards table with cards from tarot-core.
 * Run this script after creating the database tables.
 *
 * Usage: npx tsx src/seed-cards.ts
 */

import { getAllTarotCards } from "@webdrops/tarot-core";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/webdrops_tarot";

async function seedTarotCards() {
  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });

  const cards = getAllTarotCards();
  console.log(`Seeding ${cards.length} tarot cards...`);

  for (const card of cards) {
    await db
      .insert(schema.tarotCards)
      .values({
        id: card.id,
        slug: card.slug,
        name: card.name,
        arcana: card.arcana,
        suit: card.suit || null,
        keywords: card.keywords,
        reversedKeywords: card.reversedKeywords,
        visualDescription: card.visualDescription,
        detailedDescription: card.detailedDescription,
      })
      .onConflictDoNothing({
        target: schema.tarotCards.id,
      });
  }

  console.log(`✓ Seeded ${cards.length} tarot cards successfully`);

  await client.end();
}

seedTarotCards().catch((error) => {
  console.error("Failed to seed tarot cards:", error);
  process.exit(1);
});
