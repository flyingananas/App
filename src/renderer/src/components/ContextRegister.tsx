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
    } catch (err: unknown) {
      alert(`[integrity flag] ${(err as Error).message}`);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">[context] Register</h2>
        <div>
          <label className="mr-2 font-medium">Filter by Status:</label>
          <select className="border border-gray-300 rounded p-1" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="All">All</option>
            {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
          </select>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-6 flex space-x-2">
        <input type="text" placeholder="New context item..." className="flex-1 border p-2 rounded" value={newContent} onChange={e => setNewContent(e.target.value)} />
        <select className="border border-gray-300 rounded p-2" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
          <option value="">No Status</option>
          {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="p-2">Date</th>
            <th className="p-2">Content</th>
            <th className="p-2">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-2 text-sm text-gray-500 whitespace-nowrap">
                {new Date(item.created_at).toLocaleDateString()}
              </td>
              {editingId === item.id ? (
                <>
                  <td className="p-2"><input type="text" className="border w-full p-1" value={editContent} onChange={e => setEditContent(e.target.value)} /></td>
                  <td className="p-2">
                    <select className="border p-1" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      <option value="">No Status</option>
                      {statusLabels.map(lbl => <option key={lbl} value={lbl}>{lbl}</option>)}
                    </select>
                  </td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => saveEdit(item.id)} className="text-green-600">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2">{item.content}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 bg-gray-200 text-xs rounded">{item.status || 'none'}</span>
                  </td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => startEdit(item)} className="text-blue-600 underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 underline text-sm">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">No context items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
