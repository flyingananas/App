import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export let db: ReturnType<typeof Database> | null = null;

export function initDb(userDataPath: string): boolean {
  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    const dbPath = path.join(userDataPath, 'promptd.db');
    db = new Database(dbPath);
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Create schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT,
        state TEXT CHECK(state IN ('active', 'parked', 'resolved')) NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        type TEXT CHECK(type IN ('insight', 'decision', 'question', 'action', 'ref', 'parked', 'resolved', 'context', 'doc', 'condensed', 'thought', 'task', 'idea')) NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        status TEXT,
        thread_id TEXT,
        source TEXT CHECK(source IN ('manual', 'inferred')) NOT NULL,
        conclusion TEXT,
        FOREIGN KEY(thread_id) REFERENCES threads(id)
      );

      CREATE TABLE IF NOT EXISTS docs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        doc_type TEXT,
        version TEXT,
        location TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS dev_track (
        id TEXT PRIMARY KEY,
        work_date TEXT NOT NULL,
        items_worked TEXT NOT NULL,
        duration TEXT NOT NULL,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      INSERT OR IGNORE INTO settings (key, value) VALUES ('project_name', '');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('checkpoint_threshold', '15');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('syc_threshold', '200');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('status_labels', '[]');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_enabled', 'false');
    `);

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
