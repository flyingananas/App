import { describe, it, expect } from 'vitest';

function sortAppendixAEntries(items: any[], docs: any[]) {
  return [
    ...items.filter(i => i.type === 'context').map(i => ({ type: 'context', name: i.content, date: i.created_at })),
    ...docs.map(d => ({ type: 'doc', name: d.name, date: d.created_at }))
  ].sort((a, b) => a.name.localeCompare(b.name));
}

describe('Appendix A Logic', () => {
  it('correctly filters and alphabetically sorts context items and docs', () => {
    const items = [
      { type: 'thought', content: 'Not context', created_at: '2023-01-01' },
      { type: 'context', content: 'Zeta context', created_at: '2023-01-02' },
      { type: 'context', content: 'Alpha context', created_at: '2023-01-03' },
    ];
    const docs = [
      { name: 'Beta Doc', created_at: '2023-01-04' },
      { name: 'Gamma Doc', created_at: '2023-01-05' },
    ];

    const result = sortAppendixAEntries(items, docs);
    expect(result.length).toBe(4);
    expect(result[0].name).toBe('Alpha context');
    expect(result[1].name).toBe('Beta Doc');
    expect(result[2].name).toBe('Gamma Doc');
    expect(result[3].name).toBe('Zeta context');
  });
});
