import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, closeDb } from '../main/db';
import * as api from '../main/api';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';

describe('Project Migrations and Scope', () => {
  let tempDir: string;
  let dbPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptd-test-'));
    dbPath = path.join(tempDir, 'promptd.db');
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('migrates v1 schema to v2 correctly, preserving items and assigning them to a default project', () => {
    // 1. Manually create a v1 schema
    const db = new Database(dbPath);
    db.exec(`
      CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT INTO settings (key, value) VALUES ('project_name', 'Legacy Project');
      INSERT INTO settings (key, value) VALUES ('checkpoint_threshold', '99');

      CREATE TABLE threads (id TEXT PRIMARY KEY, title TEXT, state TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL);
      CREATE TABLE items (id TEXT PRIMARY KEY, type TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, status TEXT, thread_id TEXT, source TEXT NOT NULL, conclusion TEXT);
      CREATE TABLE docs (id TEXT PRIMARY KEY, name TEXT NOT NULL, doc_type TEXT, version TEXT, location TEXT, created_at TEXT NOT NULL);
      CREATE TABLE dev_track (id TEXT PRIMARY KEY, work_date TEXT NOT NULL, items_worked TEXT NOT NULL, duration TEXT NOT NULL, notes TEXT);

      INSERT INTO items (id, type, content, created_at, updated_at, source) VALUES ('item-1', 'thought', 'Legacy item', '2023', '2023', 'manual');
    `);
    db.close();

    // 2. Call initDb which runs the migration
    const success = initDb(tempDir);
    expect(success).toBe(true);

    // 3. Verify settings and projects
    const settings = api.getSettings();
    expect(settings['db_version']).toBe('2');
    const activePid = settings['active_project_id'];
    expect(activePid).toBeTruthy();

    const projects = api.getProjects();
    expect(projects.length).toBe(1);
    expect(projects[0].id).toBe(activePid);
    expect(projects[0].name).toBe('Legacy Project');
    expect(projects[0].checkpoint_threshold).toBe(99);

    // 4. Verify item was migrated and assigned to the project
    const items = api.getItems();
    expect(items.length).toBe(1);
    expect(items[0].id).toBe('item-1');
    expect(items[0].project_id).toBe(activePid);
    expect(items[0].content).toBe('Legacy item');
  });

  it('scopes items and docs strictly to the active project', () => {
    initDb(tempDir); // fresh install creates an empty DB with settings, but no projects.

    // Create Project A
    const pA = api.createProject('Project A');
    api.setSetting('active_project_id', pA.id);

    // Insert data into Project A
    api.insertItem({ type: 'thought', content: 'Item A' });
    api.insertDoc({ name: 'Doc A' });

    // Verify Project A data
    let items = api.getItems();
    expect(items.length).toBe(1);
    expect(items[0].content).toBe('Item A');

    // Create Project B
    const pB = api.createProject('Project B');
    api.setSetting('active_project_id', pB.id);

    // Verify Project B is empty
    items = api.getItems();
    expect(items.length).toBe(0);
    const docs = api.getDocs();
    expect(docs.length).toBe(0);

    // Insert data into Project B
    api.insertItem({ type: 'action', content: 'Item B' });
    items = api.getItems();
    expect(items.length).toBe(1);
    expect(items[0].content).toBe('Item B');

    // Switch back to Project A
    api.setSetting('active_project_id', pA.id);
    items = api.getItems();
    expect(items[0].content).toBe('Item A');
  });
});
