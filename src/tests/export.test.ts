import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, closeDb } from '../main/db';
import * as api from '../main/api';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Export and Import Logic', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'promptd-test-'));
    initDb(tempDir);
  });

  afterEach(() => {
    closeDb();
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('roundtrips data identically via exportData and importData', () => {
    // 1. Insert some test data
    api.setSetting('project_name', 'Test Export Project');
    api.insertItem({ type: 'thought', content: 'Test item content', source: 'manual' });
    api.insertDoc({ name: 'Test Doc', doc_type: 'PDF', location: '/tmp/test.pdf' });

    // 2. Export
    const exportedJson1 = api.exportData();
    const parsedExport1 = JSON.parse(exportedJson1);

    expect(parsedExport1.settings.find((s: any) => s.key === 'project_name').value).toBe('Test Export Project');
    expect(parsedExport1.items.length).toBe(1);
    expect(parsedExport1.docs.length).toBe(1);

    // 3. Clear the DB (import handles clearing)
    api.importData(exportedJson1);

    // 4. Export again
    const exportedJson2 = api.exportData();

    // 5. Compare
    expect(JSON.parse(exportedJson2)).toEqual(parsedExport1);
  });

  it('exports markdown successfully', () => {
    api.setSetting('project_name', 'MD Export Project');
    api.insertItem({ type: 'thought', content: 'MD item 1', source: 'manual' });
    api.insertItem({ type: 'decision', content: 'MD item 2', source: 'manual' });

    const md = api.exportMarkdown();
    expect(md).toContain('# MD Export Project');
    expect(md).toContain('- **[thought]** MD item 1');
    expect(md).toContain('- **[decision]** MD item 2');
  });
});
