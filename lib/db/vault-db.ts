import { Pool } from "pg";

let pool: Pool | null = null;
let isInitialized = false;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    const useSsl = !isLocal && (connectionString.includes("ssl") || process.env.NODE_ENV === "production");

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pool;
}

export async function initVaultTable(): Promise<boolean> {
  const db = getDbPool();
  if (!db || isInitialized) return !!db;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS vault_items (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        encrypted_data TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isInitialized = true;
    return true;
  } catch (error) {
    console.error("[Vault DB] Failed to initialize table:", error);
    return false;
  }
}
