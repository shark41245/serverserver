import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema.js";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL 없음");
    return null;
  }

  const client = postgres(databaseUrl);
  _db = drizzle(client);
  return _db;
}

export async function upsertUser({ openId }: { openId: string }) {
  const db = await getDb();
  if (!db) return;

  await db.insert(users).values({
    openId,
  });
}
