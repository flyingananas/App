import React from 'react';

export function AppendixC() {
  const versions = [
    { v: 'v1', desc: 'Initial build — base logging layer (drop/assist/idea/action).' },
    { v: 'v2', desc: 'NEW/ONGOING toggle, lgh, blank outline + user guide, full codes, index + appendices.' },
    { v: 'v3', desc: 'checkpoint cadence at 15+ items, [condensed] pointer precision, ONGOING pre-briefing, syc 200-entry self-assessment, the ? family, user-defined [context] status filter, inferred logging locked OFF by default.' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Appendix C: Version History</h2>
        <p className="text-sm text-slate-500 mt-1">Application changelog and feature releases.</p>
      </div>

      <div className="card p-6">
        <ul className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
          {versions.map(v => (
            <li key={v.v} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {v.v}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="text-sm text-slate-600 leading-relaxed">
                  {v.desc}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
