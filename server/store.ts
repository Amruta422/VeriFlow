import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Database } from './models.js';

const here = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(here, '../data/database.json');

export async function readDatabase(): Promise<Database> {
  return JSON.parse(await readFile(databasePath, 'utf8')) as Database;
}

export async function writeDatabase(database: Database): Promise<void> {
  await writeFile(databasePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
}
