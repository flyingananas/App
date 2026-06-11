import React, { useState } from 'react';

interface Props {
  items: any[];
  refreshItems: () => Promise<void>;
  statusLabels: string[];
}

export function ContextRegister({ items, refreshItems, statusLabels }: Props) {
  const [filter, setFilter] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const contextItems = items.filter(i => i.type === 'context');
  const filteredItems = filter === 'All' ? contextItems : contextItems.filter(i => i.status === filter);

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditContent(item.content);
    setEditStatus(item.status || '');
  };

  const saveEdit = async (id: string) => {
    try {
      await window.api.updateItem(id, { content: editContent, status: editStatus || null });
      setEditingId(null);
      await refreshItems();
    } catch (err: any) {
      alert(`[integrity flag] ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('[integrity flag] Are you sure you want to delete this context item?')) {
      await window.api.deleteItem(id);
      await refreshItems();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    await window.api.insertItem({ type: 'context', content: newContent, status: newStatus || null, source: 'manual' });
    setNewContent('');
    setNewStatus('');
    await refreshItems();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">[context] Register</h2>
          <p className="text-sm text-slate-500 mt-1">Load-bearing people, events, and anecdotes.</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-slate-600">Filter:</label>
          <select className="input-field py-1.5 px-3 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-4 bg-slate-50 border-dashed">
        <form onSubmit={handleAdd} className="flex space-x-3">
          <input type="text" placeholder="New context item..." className="input-field flex-1 text-sm py-2" value={newContent} onChange={e => setNewContent(e.target.value)} />
          <select className="input-field text-sm py-2 w-40" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
            <option value="">No Status</option>
            {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
          </select>
          <button type="submit" className="btn-primary text-sm px-6">Add</button>
        </form>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Date</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Status</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
                {editingId === item.id ? (
                  <>
                    <td className="p-4"><input type="text" className="input-field w-full py-1 text-sm" value={editContent} onChange={e => setEditContent(e.target.value)} /></td>
                    <td className="p-4">
                      <select className="input-field w-full py-1 text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                        <option value="">No Status</option>
                        {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => saveEdit(item.id)} className="text-emerald-600 font-medium text-sm hover:text-emerald-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 font-medium text-sm hover:text-slate-700">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-sm text-slate-800 leading-relaxed">{item.content}</td>
                    <td className="p-4">
                      {item.status ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {item.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">none</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(item)} className="text-indigo-600 font-medium text-sm hover:text-indigo-800">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 font-medium text-sm hover:text-red-700">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <p>No context items found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
