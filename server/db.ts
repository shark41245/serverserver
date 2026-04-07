import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../drizzle/schema.js";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (_db) return _db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL 없음");
    return null;
  }

  try {
    _client = postgres(databaseUrl, {
      max: 1,
      prepare: false,
    });
    _db = drizzle(_client);
    return _db;
  } catch (error) {
    console.error("DB 연결 실패:", error);
    _db = null;
    _client = null;
    return null;
  }
}

export async function upsertUser({
  openId,
  userId,
}: {
  openId: string;
  userId: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("DB 연결 실패");
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(users).values({
    openId,
    userId,
    status: "pending",
  });

  const inserted = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return inserted[0] ?? null;
}

export async function closeDb() {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
