import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, pingDb, closeDb } from '../main/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Database', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptd-test-'));
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should initialize the database file in the given directory and respond to ping', () => {
    const success = initDb(tempDir);
    expect(success).toBe(true);

    const dbPath = path.join(tempDir, 'promptd.db');
    expect(fs.existsSync(dbPath)).toBe(true);

    const isConnected = pingDb();
    expect(isConnected).toBe(true);
  });
});
