import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
   
  var __prosperePool: Pool | undefined;
   
  var __prospereDb: NodePgDatabase<typeof schema> | undefined;
}

/**
 * Conexão preguiçosa: o build e as páginas estáticas não precisam de banco de pé.
 * Em desenvolvimento o pool é reaproveitado entre hot reloads.
 */
export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalThis.__prospereDb) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL não configurada — copie .env.example para .env.');
    }
    globalThis.__prosperePool ??= new Pool({ connectionString, max: 10 });
    globalThis.__prospereDb = drizzle(globalThis.__prosperePool, { schema, casing: 'snake_case' });
  }
  return globalThis.__prospereDb;
}

export { schema };
