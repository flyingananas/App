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

    // Ensure settings table exists first for migrations
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT OR IGNORE INTO settings (key, value) VALUES ('ai_enabled', 'false');
      INSERT OR IGNORE INTO settings (key, value) VALUES ('db_version', '1');
    `);

    // Migration logic
    const dbVersionRow = db.prepare("SELECT value FROM settings WHERE key = 'db_version'").get() as { value: string } | undefined;
    const dbVersion = dbVersionRow ? parseInt(dbVersionRow.value, 10) : 1;

    if (dbVersion === 1) {
      // Check if old tables exist to migrate
      const hasOldItems = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='items'").get();

      if (!hasOldItems) {
        // Fresh install v2
        db.exec(`
          CREATE TABLE projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            checkpoint_threshold INTEGER DEFAULT 15,
            syc_threshold INTEGER DEFAULT 200,
            status_labels TEXT DEFAULT '[]',
            ai_auto_apply INTEGER DEFAULT 0
          );

          CREATE TABLE threads (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            title TEXT,
            state TEXT CHECK(state IN ('active', 'parked', 'resolved')) NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
          );

          CREATE TABLE items (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            type TEXT CHECK(type IN ('insight', 'decision', 'question', 'action', 'ref', 'parked', 'resolved', 'context', 'doc', 'condensed', 'thought', 'task', 'idea')) NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            status TEXT,
            thread_id TEXT,
            source TEXT CHECK(source IN ('manual', 'inferred')) NOT NULL,
            conclusion TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE
          );

          CREATE TABLE docs (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            doc_type TEXT,
            version TEXT,
            location TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
          );

          CREATE TABLE dev_track (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            work_date TEXT NOT NULL,
            items_worked TEXT NOT NULL,
            duration TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
          );
        `);
      } else {
        // Migrate existing v1 schema to v2
        const tx = db.transaction(() => {
          // Get old settings
          const oldSettingsRows = db!.prepare("SELECT * FROM settings").all() as { key: string, value: string }[];
          const oldSettings = oldSettingsRows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {} as Record<string, string>);
          const defaultProjectName = oldSettings['project_name'] || 'Default Project';
          const defaultProjectId = 'default-project-id';

          db!.exec(`
            CREATE TABLE projects (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              created_at TEXT NOT NULL,
              checkpoint_threshold INTEGER DEFAULT 15,
              syc_threshold INTEGER DEFAULT 200,
              status_labels TEXT DEFAULT '[]',
              ai_auto_apply INTEGER DEFAULT 0
            );
          `);

          db!.prepare(`
            INSERT INTO projects (id, name, created_at, checkpoint_threshold, syc_threshold, status_labels)
            VALUES (@id, @name, @created_at, @cp, @syc, @labels)
          `).run({
            id: defaultProjectId,
            name: defaultProjectName,
            created_at: new Date().toISOString(),
            cp: parseInt(oldSettings['checkpoint_threshold'] || '15', 10),
            syc: parseInt(oldSettings['syc_threshold'] || '200', 10),
            labels: oldSettings['status_labels'] || '[]'
          });

          // Rename old tables
          db!.exec(`
            ALTER TABLE items RENAME TO _old_items;
            ALTER TABLE threads RENAME TO _old_threads;
            ALTER TABLE docs RENAME TO _old_docs;
            ALTER TABLE dev_track RENAME TO _old_dev_track;
          `);

          // Create new tables with project_id
          db!.exec(`
            CREATE TABLE threads (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              title TEXT,
              state TEXT CHECK(state IN ('active', 'parked', 'resolved')) NOT NULL DEFAULT 'active',
              created_at TEXT NOT NULL,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE items (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              type TEXT CHECK(type IN ('insight', 'decision', 'question', 'action', 'ref', 'parked', 'resolved', 'context', 'doc', 'condensed', 'thought', 'task', 'idea')) NOT NULL,
              content TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              status TEXT,
              thread_id TEXT,
              source TEXT CHECK(source IN ('manual', 'inferred')) NOT NULL,
              conclusion TEXT,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
              FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE
            );

            CREATE TABLE docs (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              name TEXT NOT NULL,
              doc_type TEXT,
              version TEXT,
              location TEXT,
              created_at TEXT NOT NULL,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
            );

            CREATE TABLE dev_track (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              work_date TEXT NOT NULL,
              items_worked TEXT NOT NULL,
              duration TEXT NOT NULL,
              notes TEXT,
              FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
          `);

          // Copy data over assigning default project
          db!.exec(`
            INSERT INTO threads (id, project_id, title, state, created_at)
            SELECT id, '${defaultProjectId}', title, state, created_at FROM _old_threads;

            INSERT INTO items (id, project_id, type, content, created_at, updated_at, status, thread_id, source, conclusion)
            SELECT id, '${defaultProjectId}', type, content, created_at, updated_at, status, thread_id, source, conclusion FROM _old_items;

            INSERT INTO docs (id, project_id, name, doc_type, version, location, created_at)
            SELECT id, '${defaultProjectId}', name, doc_type, version, location, created_at FROM _old_docs;

            INSERT INTO dev_track (id, project_id, work_date, items_worked, duration, notes)
            SELECT id, '${defaultProjectId}', work_date, items_worked, duration, notes FROM _old_dev_track;

            DROP TABLE _old_items;
            DROP TABLE _old_threads;
            DROP TABLE _old_docs;
            DROP TABLE _old_dev_track;
          `);

          // Set active project setting
          db!.prepare(`INSERT INTO settings (key, value) VALUES ('active_project_id', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(defaultProjectId);
          // Delete old project-specific keys from settings to clean up
          db!.exec(`DELETE FROM settings WHERE key IN ('project_name', 'checkpoint_threshold', 'syc_threshold', 'status_labels')`);
        });
        tx();
      }

      db.prepare(`UPDATE settings SET value = '2' WHERE key = 'db_version'`).run();
    }

    // Enable foreign keys for cascade deletes
    db.pragma('foreign_keys = ON');

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
