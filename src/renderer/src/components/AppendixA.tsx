import React, { useEffect, useState } from 'react';

interface Props {
  items: any[];
  onNavigateToOutline: (id?: string) => void;
}

export function AppendixA({ items, onNavigateToOutline }: Props) {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    window.api.getDocs().then(setDocs);
  }, []);

  const crossRef = [
    ...items.filter(i => i.type === 'context').map(i => ({ id: i.id, type: 'context', name: i.content, date: i.created_at })),
    ...docs.map(d => ({ id: d.id, type: 'doc', name: d.name, date: d.created_at }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Appendix A</h2>
        <p className="text-sm text-slate-500 mt-1">Cross-Reference of all contexts and documents.</p>
      </div>
      <div className="card">
        <ul className="divide-y divide-slate-100">
          {crossRef.map((entry, idx) => (
            <li key={idx} className="p-4 hover:bg-slate-50/80 transition-colors flex justify-between items-center group">
              <span className="flex items-center space-x-3">
                <span className="font-mono text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded tracking-wider">[{entry.type}]</span>
                <span className="text-slate-800 font-medium">{entry.name}</span>
              </span>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => onNavigateToOutline(entry.id)}
                  className="text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Go to Outline</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
                <span className="text-sm text-slate-400 font-medium tabular-nums">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
          {crossRef.length === 0 && (
            <li className="p-12 text-center text-slate-500">
              <div className="flex flex-col items-center">
                <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p>No cross-references found.</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
