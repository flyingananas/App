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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Appendix A: Cross-Reference</h2>
      <ul className="space-y-2">
        {crossRef.map((entry, idx) => (
          <li key={idx} className="p-2 bg-white border border-gray-200 rounded flex justify-between items-center group">
            <span>
              <span className="font-mono text-xs uppercase text-gray-500 mr-2">[{entry.type}]</span>
              {entry.name}
            </span>
            <div className="space-x-4">
              <button
                onClick={() => onNavigateToOutline(entry.id)}
                className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity underline"
              >
                Go to Outline
              </button>
              <span className="text-sm text-gray-400">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
