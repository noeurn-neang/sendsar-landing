import "server-only";

import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | null = null;

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST ?? "localhost";
  const port = process.env.DB_PORT ?? "5433";
  const user = process.env.DB_USER ?? "sendsar";
  const password = process.env.DB_PASSWORD ?? "";
  const database = process.env.DB_NAME ?? "sendsar_db";

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function poolMax(): number {
  const raw = Number(process.env.DB_POOL_MAX ?? "");
  if (Number.isFinite(raw) && raw > 0) return Math.min(20, Math.floor(raw));
  // Prefer a small pool on serverless / shared hosting.
  return process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? 4 : 10;
}

export function getPool(): Pool {
  if (!pool) {
    const connectionString = buildDatabaseUrl();
    try {
      const host = new URL(connectionString.replace(/^postgresql:/, "http:")).host;
      console.info(`[db] connecting to ${host} (max=${poolMax()})`);
    } catch {
      console.info("[db] connecting");
    }

    pool = new Pool({
      connectionString,
      max: poolMax(),
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      // Cap runaway queries from the console.
      options: "-c statement_timeout=15000",
    });

    pool.on("error", (error) => {
      console.error("[db] idle client error", error);
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
