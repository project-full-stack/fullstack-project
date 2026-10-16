import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://g03:g03fs69@postgres:5432/reserve_db';
const client = postgres(connectionString);

export const db = drizzle(client, { schema });