import crypto from 'crypto';
import { db } from './db';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  checkpoint_threshold: number;
  syc_threshold: number;
  status_labels: string;
  ai_auto_apply: number;
}

export interface Item {
  id: string;
  project_id: string;
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
  project_id: string;
  work_date: string;
  items_worked: string;
  duration: string;
  notes: string | null;
}

export interface Doc {
  id: string;
  project_id: string;
  name: string;
  doc_type: string | null;
  version: string | null;
  location: string | null;
  created_at: string;
}

// Settings
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

export function getActiveProjectId(): string {
  const settings = getSettings();
  let projectId = settings['active_project_id'];

  const validateOrFallback = () => {
    let projects = getProjects();
    if (projects.length === 0) {
      // Create a default project if none exist to ensure app doesn't hang
      const defaultProject = createProject('Default Project');
      projectId = defaultProject.id;
      setSetting('active_project_id', projectId);
      return projectId;
    } else {
      projectId = projects[0].id;
      setSetting('active_project_id', projectId);
      return projectId;
    }
  };

  if (!projectId) {
    return validateOrFallback();
  }

  // Validate that the project still exists
  if (!db) throw new Error('Database not initialized');
  const projectExists = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);
  if (!projectExists) {
    return validateOrFallback();
  }

  return projectId;
}

// Projects
export function getProjects(): Project[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Project[];
}

export function getActiveProject(): Project {
  if (!db) throw new Error('Database not initialized');
  const projectId = getActiveProjectId();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as Project | undefined;
  if (!project) throw new Error('Active project not found in database.');
  return project;
}

export function createProject(name: string, statusLabels: string[] = []): Project {
  if (!db) throw new Error('Database not initialized');
  const id = crypto.randomUUID();
  const newProject = {
    id,
    name,
    created_at: new Date().toISOString(),
    checkpoint_threshold: 15,
    syc_threshold: 200,
    status_labels: JSON.stringify(statusLabels),
    ai_auto_apply: 0
  };
  db.prepare(`
    INSERT INTO projects (id, name, created_at, checkpoint_threshold, syc_threshold, status_labels, ai_auto_apply)
    VALUES (@id, @name, @created_at, @checkpoint_threshold, @syc_threshold, @status_labels, @ai_auto_apply)
  `).run(newProject);
  return newProject as Project;
}

export function updateProject(id: string, updates: Partial<Project>): void {
  if (!db) throw new Error('Database not initialized');
  const current = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
  if (!current) throw new Error('Project not found');
  const merged = { ...current, ...updates };
  db.prepare(`
    UPDATE projects SET
      name = @name, checkpoint_threshold = @checkpoint_threshold,
      syc_threshold = @syc_threshold, status_labels = @status_labels, ai_auto_apply = @ai_auto_apply
    WHERE id = @id
  `).run(merged);
}

export function deleteProject(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);

  // Reset active project if deleted
  const settings = getSettings();
  if (settings['active_project_id'] === id) {
    const remaining = getProjects();
    if (remaining.length > 0) {
      setSetting('active_project_id', remaining[0].id);
    } else {
      db.prepare('DELETE FROM settings WHERE key = ?').run('active_project_id');
    }
  }
}

// Items
export function insertItem(item: Partial<Item>): Item {
  if (!db) throw new Error('Database not initialized');
  const now = new Date().toISOString();
  const newItem: Item = {
    id: item.id || crypto.randomUUID(),
    project_id: item.project_id || getActiveProjectId(),
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
    INSERT INTO items (id, project_id, type, content, created_at, updated_at, status, thread_id, source, conclusion)
    VALUES (@id, @project_id, @type, @content, @created_at, @updated_at, @status, @thread_id, @source, @conclusion)
  `);
  stmt.run(newItem);
  return newItem;
}

export function getItems(): Item[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM items WHERE project_id = ? ORDER BY created_at ASC').all(getActiveProjectId()) as Item[];
}

export function updateItem(id: string, updates: Partial<Item>): void {
  if (!db) throw new Error('Database not initialized');
  const current = db.prepare('SELECT * FROM items WHERE id = ? AND project_id = ?').get(id, getActiveProjectId()) as Item;
  if (!current) throw new Error('Item not found');
  const merged = { ...current, ...updates, updated_at: new Date().toISOString() };

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
    WHERE id = @id AND project_id = @project_id
  `).run(merged);
}

export function deleteItem(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare('DELETE FROM items WHERE id = ? AND project_id = ?').run(id, getActiveProjectId());
}

// Dev Tracks
export function insertDevTrack(track: Omit<DevTrack, 'id' | 'project_id'>): DevTrack {
  if (!db) throw new Error('Database not initialized');
  const newTrack: DevTrack = {
    id: crypto.randomUUID(),
    project_id: getActiveProjectId(),
    ...track,
  };

  const stmt = db.prepare(`
    INSERT INTO dev_track (id, project_id, work_date, items_worked, duration, notes)
    VALUES (@id, @project_id, @work_date, @items_worked, @duration, @notes)
  `);
  stmt.run(newTrack);
  return newTrack;
}

export function getDevTracks(): DevTrack[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM dev_track WHERE project_id = ? ORDER BY work_date DESC').all(getActiveProjectId()) as DevTrack[];
}

export function getLastDevTrack(): DevTrack | null {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM dev_track WHERE project_id = ? ORDER BY work_date DESC LIMIT 1').get(getActiveProjectId()) as DevTrack | null;
}

// Docs
export function insertDoc(doc: Partial<Doc>): Doc {
  if (!db) throw new Error('Database not initialized');
  const newDoc: Doc = {
    id: doc.id || crypto.randomUUID(),
    project_id: doc.project_id || getActiveProjectId(),
    name: doc.name || 'Untitled',
    doc_type: doc.doc_type || null,
    version: doc.version || null,
    location: doc.location || null,
    created_at: doc.created_at || new Date().toISOString(),
  };
  db.prepare(`
    INSERT INTO docs (id, project_id, name, doc_type, version, location, created_at)
    VALUES (@id, @project_id, @name, @doc_type, @version, @location, @created_at)
  `).run(newDoc);
  return newDoc;
}

export function updateDoc(id: string, updates: Partial<Doc>): void {
  if (!db) throw new Error('Database not initialized');
  const current = db.prepare('SELECT * FROM docs WHERE id = ? AND project_id = ?').get(id, getActiveProjectId()) as Doc;
  if (!current) throw new Error('Doc not found');
  const merged = { ...current, ...updates };
  db.prepare(`
    UPDATE docs SET name = @name, doc_type = @doc_type, version = @version, location = @location
    WHERE id = @id AND project_id = @project_id
  `).run(merged);
}

export function getDocs(): Doc[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare('SELECT * FROM docs WHERE project_id = ? ORDER BY created_at ASC').all(getActiveProjectId()) as Doc[];
}

export function deleteDoc(id: string): void {
  if (!db) throw new Error('Database not initialized');
  db.prepare('DELETE FROM docs WHERE id = ? AND project_id = ?').run(id, getActiveProjectId());
}

// Threads & Actions
export function updateThreadState(state: 'active' | 'parked' | 'resolved'): void {
  if (!db) throw new Error('Database not initialized');
  const pid = getActiveProjectId();
  if (state === 'parked') {
    db.prepare(`UPDATE threads SET state = 'parked' WHERE state = 'active' AND project_id = ?`).run(pid);
  } else if (state === 'active') {
    db.prepare(`UPDATE threads SET state = 'active' WHERE state = 'parked' AND project_id = ?`).run(pid);
  }
}

export function getActiveThreads(): { id: string, title: string }[] {
  if (!db) throw new Error('Database not initialized');
  return db.prepare(`SELECT id, title FROM threads WHERE state = 'active' AND project_id = ?`).all(getActiveProjectId()) as { id: string, title: string }[];
}

export function activateItemByText(text: string): boolean {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(`UPDATE items SET type = 'action', updated_at = @now WHERE content LIKE @text AND project_id = @pid`);
  const result = stmt.run({ now: new Date().toISOString(), text: `%${text}%`, pid: getActiveProjectId() });
  return result.changes > 0;
}

// Exports
export function exportData(): string {
  if (!db) throw new Error('Database not initialized');
  const pid = getActiveProjectId();
  const data = {
    settings: db.prepare('SELECT * FROM settings').all(),
    projects: db.prepare('SELECT * FROM projects').all(),
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
    db!.prepare('DELETE FROM projects').run();

    if (data.settings) {
      const stmt = db!.prepare('INSERT INTO settings (key, value) VALUES (@key, @value)');
      for (const row of data.settings) stmt.run(row);
    }
    if (data.projects) {
      const stmt = db!.prepare('INSERT INTO projects (id, name, created_at, checkpoint_threshold, syc_threshold, status_labels, ai_auto_apply) VALUES (@id, @name, @created_at, @checkpoint_threshold, @syc_threshold, @status_labels, @ai_auto_apply)');
      for (const row of data.projects) stmt.run(row);
    }
    if (data.threads) {
      const stmt = db!.prepare('INSERT INTO threads (id, project_id, title, state, created_at) VALUES (@id, @project_id, @title, @state, @created_at)');
      for (const row of data.threads) stmt.run(row);
    }
    if (data.items) {
      const stmt = db!.prepare(`
        INSERT INTO items (id, project_id, type, content, created_at, updated_at, status, thread_id, source, conclusion)
        VALUES (@id, @project_id, @type, @content, @created_at, @updated_at, @status, @thread_id, @source, @conclusion)
      `);
      for (const row of data.items) stmt.run(row);
    }
    if (data.docs) {
      const stmt = db!.prepare(`
        INSERT INTO docs (id, project_id, name, doc_type, version, location, created_at)
        VALUES (@id, @project_id, @name, @doc_type, @version, @location, @created_at)
      `);
      for (const row of data.docs) stmt.run(row);
    }
    if (data.dev_track) {
      const stmt = db!.prepare(`
        INSERT INTO dev_track (id, project_id, work_date, items_worked, duration, notes)
        VALUES (@id, @project_id, @work_date, @items_worked, @duration, @notes)
      `);
      for (const row of data.dev_track) stmt.run(row);
    }
  });

  tx();
}

export function exportMarkdown(): string {
  if (!db) throw new Error('Database not initialized');
  const project = getActiveProject();
  const items = getItems();

  let md = `# ${project.name || 'Prompt D Project'}\n\n`;
  md += `## Outline\n\n`;
  for (const item of items) {
    md += `- **[${item.type}]** ${item.content}\n`;
  }
  return md;
}

// Ensure the parser logic resides in main or renderer
