import React from 'react';

export function AppendixB() {
  const codes = [
    { code: 'drp', full: 'drop:', desc: 'Log silently. Reply "noted". Auto-timestamp.' },
    { code: 'hlp', full: 'assist:', desc: 'Log AND help immediately.' },
    { code: 'ida', full: 'idea:', desc: 'Log as an idea worth developing.' },
    { code: 'act', full: 'action:', desc: 'Activate a specific logged item by matching.' },
    { code: 'lgh', full: 'log hours', desc: 'Four-question work-block log.' },
    { code: 'mth', full: 'mark this', desc: 'Add current point to outline immediately.' },
    { code: 'mta', full: 'mark this as [x]', desc: 'Add with explicit item type.' },
    { code: 'pth', full: 'park this', desc: 'Manually park the current thread.' },
    { code: 'rtp', full: 'return to parked', desc: 'Resume a parked thread.' },
    { code: 'wmc', full: 'watch my threads closely today', desc: 'Activate thread watch + inferred logging.' },
    { code: 'rtw', full: 'relax thread watch', desc: 'Return to silent mode.' },
    { code: 'syc', full: 'system check', desc: 'Self-assessment.' },
    { code: '???', full: '?codes', desc: 'Full inline glossary.' },
    { code: '?[code]', full: '?[full]', desc: 'One-line explanation.' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appendix B: Glossary</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="p-2">Code</th>
            <th className="p-2">Full Phrase</th>
            <th className="p-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {codes.map(c => (
            <tr key={c.code} className="border-b border-gray-200">
              <td className="p-2 font-mono text-sm">{c.code}</td>
              <td className="p-2 font-mono text-sm">{c.full}</td>
              <td className="p-2">{c.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
