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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Appendix B: Glossary</h2>
        <p className="text-sm text-slate-500 mt-1">Full inline glossary of all active cue words and commands.</p>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Code</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-64">Full Phrase</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {codes.map(c => (
              <tr key={c.code} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{c.code}</span>
                </td>
                <td className="p-4">
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{c.full}</span>
                </td>
                <td className="p-4 text-sm text-slate-700 leading-relaxed">{c.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
