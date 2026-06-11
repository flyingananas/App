import React, { useState, useEffect } from 'react';

export function HistoryArchive() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    window.api.getItems().then(setItems);
  }, []);

  // Split logic: 'resolved' items go to history. Everything else is active.
  const activeItems = items.filter(item => item.type !== 'resolved');
  const historyItems = items.filter(item => item.type === 'resolved');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">History & Archive</h2>
        <p className="text-sm text-slate-500 mt-1">Review active and resolved items side-by-side.</p>
      </div>

      <div className="flex space-x-6">
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg text-emerald-700 border-b border-emerald-100 pb-2">Active</h3>
          <div className="space-y-3">
            {activeItems.map((item) => (
              <div key={item.id} className="card p-4 border-l-4 border-l-emerald-400">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">[{item.type}]</span>
                <div className="text-sm text-slate-800 leading-relaxed">{item.content}</div>
                <div className="text-xs text-slate-400 mt-3 font-medium">{new Date(item.created_at).toLocaleString()}</div>
              </div>
            ))}
            {activeItems.length === 0 && <p className="text-slate-500 text-sm italic">No active items.</p>}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg text-slate-500 border-b border-slate-200 pb-2">History (Resolved)</h3>
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div key={item.id} className="card p-4 bg-slate-50 border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">[{item.type}]</span>
                <div className="text-sm text-slate-600 leading-relaxed line-through decoration-slate-300">{item.content}</div>
                {item.conclusion && (
                  <div className="text-sm mt-3 bg-white p-2 rounded border border-slate-100 font-medium text-slate-700 shadow-sm flex items-start space-x-2">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{item.conclusion}</span>
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-3 font-medium">{new Date(item.created_at).toLocaleString()}</div>
              </div>
            ))}
            {historyItems.length === 0 && <p className="text-slate-500 text-sm italic">No history items.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
