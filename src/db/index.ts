import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: NodePgDatabase;
};

/**
 * Create the pool lazily — never at module-evaluation time. Importing this
 * module during `next build` (page-data collection) must not throw, so the
 * "DATABASE_URL is required" check happens only when a query is actually run.
 */
export function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  globalForDb.__arenaNextJsPostgresqlPool ??= new Pool({
    connectionString: databaseUrl,
  });
  return globalForDb.__arenaNextJsPostgresqlPool;
}

export function getDb(): NodePgDatabase {
  globalForDb.__arenaNextJsPostgresqlDb ??= drizzle(getPool());
  return globalForDb.__arenaNextJsPostgresqlDb;
}

type DrizzleDb = NodePgDatabase<Record<string, never>>;

/**
 * Lazy proxy so existing `import { db } from "@/db"` call sites keep working
 * unchanged, while construction (and the env check) is deferred to first use.
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

