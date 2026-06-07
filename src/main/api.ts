import crypto from 'crypto';
import { db } from './db';

export interface Item {
  id: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string | null;
  thread_id: string | null;
  source: 'manual' | 'inferred';
  conclusion: string | null;
}

export interface DevTrack {
  id: string;
  work_date: string;
  items_worked: string;
  duration: string;
  notes: string | null;
}

export function insertItem(item: Partial<Item>): Item {
  if (!db) throw new Error('Database not initialized');
  const now = new Date().toISOString();
  const newItem: Item = {
    id: item.id || crypto.randomUUID(),
    type: item.type || 'thought',
    content: item.content || '',
    created_at: item.created_at || now,
    updated_at: item.updated_at || now,
    status: item.status || null,
    thread_id: item.thread_id || null,
    source: item.source || 'manual',
    conclusion: item.conclusion || null,
  };

  const stmt = db.prepare(`
    INSERT INTO items (id, type, content, created_at, updated_at, status, thread_id, source, conclusion)
    VALUES (@id, @type, @content, @created_at, @updated_at, @status, @thread_id, @source, @conclusion)
  `);
  stmt.run(newItem);
  return newItem;
}

export function getItems(): Item[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM items ORDER BY created_at ASC').all() as Item[];
}

export function insertDevTrack(track: Omit<DevTrack, 'id'>): DevTrack {
  if (!db) throw new Error('Database not initialized');
  const newTrack: DevTrack = {
    id: crypto.randomUUID(),
    ...track,
  };

  const stmt = db.prepare(`
    INSERT INTO dev_track (id, work_date, items_worked, duration, notes)
    VALUES (@id, @work_date, @items_worked, @duration, @notes)
  `);
  stmt.run(newTrack);
  return newTrack;
}

export function getDevTracks(): DevTrack[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM dev_track ORDER BY work_date DESC').all() as DevTrack[];
}

export function getLastDevTrack(): DevTrack | null {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM dev_track ORDER BY work_date DESC LIMIT 1').get() as DevTrack | null;
}

export function getSettings(): Record<string, string> {
  if (!db) throw new Error('Database not initialized');
  const rows = db.prepare('SELECT * FROM settings').all() as { key: string; value: string }[];
  return rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);
}

export function setSetting(key: string, value: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare(`INSERT INTO settings (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = @value`).run({ key, value });
}

export function updateItem(id: string, updates: Partial<Item>): void {
  if (!db) throw new Error('Database not initialized');
  const current = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Item;
  if (!current) throw new Error('Item not found');
  const merged = { ...current, ...updates, updated_at: new Date().toISOString() };

  // Guardrails
  if (merged.type === 'resolved' && (!merged.conclusion || merged.conclusion.trim() === '')) {
    throw new Error('Conclusion required to set item to resolved.');
  }

  if (merged.type === 'parked' && merged.status === 'resolved') {
    throw new Error('An item cannot be both parked and resolved.');
  }

  db.prepare(`
    UPDATE items SET
      type = @type, content = @content, updated_at = @updated_at,
      status = @status, thread_id = @thread_id, conclusion = @conclusion
    WHERE id = @id
  `).run(merged);
}

export function deleteItem(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare('DELETE FROM items WHERE id = ?').run(id);
}

export interface Doc {
  id: string;
  name: string;
  doc_type: string | null;
  version: string | null;
  location: string | null;
  created_at: string;
}

export function insertDoc(doc: Partial<Doc>): Doc {
  if (!db) throw new Error('Database not initialized');
  const newDoc: Doc = {
    id: doc.id || crypto.randomUUID(),
    name: doc.name || 'Untitled',
    doc_type: doc.doc_type || null,
    version: doc.version || null,
    location: doc.location || null,
    created_at: doc.created_at || new Date().toISOString(),
  };
  db.prepare(`
    INSERT INTO docs (id, name, doc_type, version, location, created_at)
    VALUES (@id, @name, @doc_type, @version, @location, @created_at)
  `).run(newDoc);
  return newDoc;
}

export function updateDoc(id: string, updates: Partial<Doc>): void {
  if (!db) throw new Error('Database not initialized');
  const current = db.prepare('SELECT * FROM docs WHERE id = ?').get(id) as Doc;
  if (!current) throw new Error('Doc not found');
  const merged = { ...current, ...updates };
  db.prepare(`
    UPDATE docs SET name = @name, doc_type = @doc_type, version = @version, location = @location
    WHERE id = @id
  `).run(merged);
}

export function getDocs(): Doc[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM docs ORDER BY created_at ASC').all() as Doc[];
}

export function deleteDoc(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare('DELETE FROM docs WHERE id = ?').run(id);
}

export function exportData(): string {
  if (!db) throw new Error('Database not initialized');
  const data = {
    settings: db.prepare('SELECT * FROM settings').all(),
    threads: db.prepare('SELECT * FROM threads').all(),
    items: db.prepare('SELECT * FROM items').all(),
    docs: db.prepare('SELECT * FROM docs').all(),
    dev_track: db.prepare('SELECT * FROM dev_track').all(),
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonData: string): void {
  if (!db) throw new Error('Database not initialized');
  const data = JSON.parse(jsonData);

  const tx = db.transaction(() => {
    db!.prepare('DELETE FROM settings').run();
    db!.prepare('DELETE FROM items').run();
    db!.prepare('DELETE FROM threads').run();
    db!.prepare('DELETE FROM docs').run();
    db!.prepare('DELETE FROM dev_track').run();

    if (data.settings) {
      const stmt = db!.prepare('INSERT INTO settings (key, value) VALUES (@key, @value)');
      for (const row of data.settings) stmt.run(row);
    }
    if (data.threads) {
      const stmt = db!.prepare('INSERT INTO threads (id, title, state, created_at) VALUES (@id, @title, @state, @created_at)');
      for (const row of data.threads) stmt.run(row);
    }
    if (data.items) {
      const stmt = db!.prepare(`
        INSERT INTO items (id, type, content, created_at, updated_at, status, thread_id, source, conclusion)
        VALUES (@id, @type, @content, @created_at, @updated_at, @status, @thread_id, @source, @conclusion)
      `);
      for (const row of data.items) stmt.run(row);
    }
    if (data.docs) {
      const stmt = db!.prepare(`
        INSERT INTO docs (id, name, doc_type, version, location, created_at)
        VALUES (@id, @name, @doc_type, @version, @location, @created_at)
      `);
      for (const row of data.docs) stmt.run(row);
    }
    if (data.dev_track) {
      const stmt = db!.prepare(`
        INSERT INTO dev_track (id, work_date, items_worked, duration, notes)
        VALUES (@id, @work_date, @items_worked, @duration, @notes)
      `);
      for (const row of data.dev_track) stmt.run(row);
    }
  });

  tx();
}

export function exportMarkdown(): string {
  if (!db) throw new Error('Database not initialized');
  const settings = getSettings();
  const items = getItems();

  let md = `# ${settings.project_name || 'Prompt D Project'}\n\n`;
  md += `## Outline\n\n`;
  for (const item of items) {
    md += `- **[${item.type}]** ${item.content}\n`;
  }
  return md;
}

export function updateThreadState(state: 'active' | 'parked' | 'resolved'): void {
  if (!db) throw new Error('Database not initialized');
  // Since we only have a basic implementation and single-thread context for now,
  // we will update all active/parked threads. In a full implementation, this would use the current active thread_id.
  if (state === 'parked') {
    db.prepare(`UPDATE threads SET state = 'parked' WHERE state = 'active'`).run();
  } else if (state === 'active') {
    db.prepare(`UPDATE threads SET state = 'active' WHERE state = 'parked'`).run();
  }
}

export function activateItemByText(text: string): boolean {
  if (!db) throw new Error('Database not initialized');
  // Match an item by text and update it (e.g. mark it as action/active).
  // The spec says "mark a logged item active by matching its text."
  // We'll interpret this as changing its type to 'action' or appending a status.
  const stmt = db.prepare(`UPDATE items SET type = 'action', updated_at = @now WHERE content LIKE @text`);
  const result = stmt.run({ now: new Date().toISOString(), text: `%${text}%` });
  return result.changes > 0;
}

// Ensure the parser logic resides in main or renderer
