import React from 'react';

export function AppendixC() {
  const versions = [
    { v: 'v1', desc: 'Initial build — base logging layer (drop/assist/idea/action).' },
    { v: 'v2', desc: 'NEW/ONGOING toggle, lgh, blank outline + user guide, full codes, index + appendices.' },
    { v: 'v3', desc: 'checkpoint cadence at 15+ items, [condensed] pointer precision, ONGOING pre-briefing, syc 200-entry self-assessment, the ? family, user-defined [context] status filter, inferred logging locked OFF by default.' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appendix C: Version History</h2>
      <ul className="space-y-4">
        {versions.map(v => (
          <li key={v.v}>
            <strong>{v.v}:</strong> {v.desc}
          </li>
        ))}
      </ul>
    </div>
  );
}
