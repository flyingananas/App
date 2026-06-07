import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: ReturnType<typeof Database> | null = null;

export function initDb(userDataPath: string): boolean {
  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const dbPath = path.join(userDataPath, 'promptd.db');
    db = new Database(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

export function pingDb(): boolean {
  if (!db) return false;
  try {
    const row = db.prepare('SELECT 1 as ping').get() as { ping: number };
    return row.ping === 1;
  } catch (error) {
    console.error('Failed to ping database:', error);
    return false;
  }
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
