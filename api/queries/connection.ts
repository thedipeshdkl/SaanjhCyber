import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let pool: mysql.Pool;

function parseDbUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "127.0.0.1",
    port: parseInt(parsed.port || "3306", 10),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace("/", ""),
  };
}

export function getDb() {
  if (!instance) {
    const config = parseDbUrl(env.databaseUrl);
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 10000,
    });
    instance = drizzle(pool, { schema: fullSchema, mode: "default" });
  }
  return instance;
}
