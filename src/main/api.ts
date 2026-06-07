import { v4 as uuidv4 } from 'uuid';
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
    id: item.id || uuidv4(),
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
    id: uuidv4(),
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
