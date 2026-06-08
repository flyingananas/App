import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, closeDb } from '../main/db';
import * as api from '../main/api';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('App Database Methods', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptd-test-'));
    initDb(tempDir);
    // Setup active project for tests
    const p = api.createProject('Test Project');
    api.setSetting('active_project_id', p.id);
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('handles item guardrails correctly', () => {
    const item = api.insertItem({ type: 'thought', content: 'test item' });

    // Changing to resolved without conclusion should throw
    expect(() => {
      api.updateItem(item.id, { type: 'resolved' });
    }).toThrow('Conclusion required');

    // Changing to resolved with conclusion should succeed
    expect(() => {
      api.updateItem(item.id, { type: 'resolved', conclusion: 'done' });
    }).not.toThrow();
  });
});
