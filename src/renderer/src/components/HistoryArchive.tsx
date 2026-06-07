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
    <div className="p-6 max-w-4xl mx-auto flex space-x-6">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-green-700">Active</h2>
        <ul className="space-y-3">
          {activeItems.map((item) => (
            <li key={item.id} className="p-3 bg-white border border-gray-200 rounded shadow-sm">
              <span className="font-mono text-xs uppercase text-gray-500 block mb-1">[{item.type}]</span>
              <div className="text-sm">{item.content}</div>
              <div className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleString()}</div>
            </li>
          ))}
          {activeItems.length === 0 && <p className="text-gray-500 text-sm">No active items.</p>}
        </ul>
      </div>

      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-700">History (Resolved)</h2>
        <ul className="space-y-3">
          {historyItems.map((item) => (
            <li key={item.id} className="p-3 bg-gray-50 border border-gray-200 rounded shadow-sm opacity-75 hover:opacity-100 transition-opacity">
              <span className="font-mono text-xs uppercase text-gray-500 block mb-1">[{item.type}]</span>
              <div className="text-sm">{item.content}</div>
              {item.conclusion && (
                <div className="text-sm mt-2 font-medium italic">Conclusion: {item.conclusion}</div>
              )}
              <div className="text-xs text-gray-400 mt-2">{new Date(item.created_at).toLocaleString()}</div>
            </li>
          ))}
          {historyItems.length === 0 && <p className="text-gray-500 text-sm">No history items.</p>}
        </ul>
      </div>
    </div>
  );
}
