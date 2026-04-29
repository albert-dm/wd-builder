/**
 * Database connection for Guia da Roda.
 * Server-only module - uses Drizzle ORM with PostgreSQL.
 * This file should NOT be imported by client code.
 */

import * as schema from "@webdrops/tarot-db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/webdrops_tarot"
  );
}

export function getClient(): ReturnType<typeof postgres> {
  if (!client) {
    client = postgres(getDatabaseUrl());
  }
  return client;
}

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    db = drizzle(getClient(), { schema });
  }
  return db;
}

export function closeDb(): void {
  if (client) {
    client.end();
    client = null;
    db = null;
  }
}
