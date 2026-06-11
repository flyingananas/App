import React, { useEffect, useState } from 'react';

export function DocRegister() {
  const [docs, setDocs] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<any>({});
  const [newDoc, setNewDoc] = useState({ name: '', doc_type: '', version: '', location: '' });

  const loadDocs = async () => {
    const d = await window.api.getDocs();
    setDocs(d);
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const startEdit = (doc: any) => {
    setEditingId(doc.id);
    setEditDoc({ ...doc });
  };

  const saveEdit = async (id: string) => {
    try {
      await window.api.updateDoc(id, editDoc);
      setEditingId(null);
      await loadDocs();
    } catch (err: any) {
      alert(`[integrity flag] ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('[integrity flag] Are you sure you want to delete this document?')) {
      await window.api.deleteDoc(id);
      await loadDocs();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name.trim()) return;
    await window.api.insertDoc(newDoc);
    setNewDoc({ name: '', doc_type: '', version: '', location: '' });
    await loadDocs();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">[doc] Register</h2>
        <p className="text-sm text-slate-500 mt-1">Track external documents, files, and links.</p>
      </div>

      <div className="card p-4 bg-slate-50 border-dashed">
        <form onSubmit={handleAdd} className="flex space-x-3">
          <input type="text" placeholder="Name" className="input-field w-1/4 text-sm py-2" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} required />
          <input type="text" placeholder="Type" className="input-field w-32 text-sm py-2" value={newDoc.doc_type} onChange={e => setNewDoc({...newDoc, doc_type: e.target.value})} />
          <input type="text" placeholder="Version" className="input-field w-24 text-sm py-2" value={newDoc.version} onChange={e => setNewDoc({...newDoc, version: e.target.value})} />
          <input type="text" placeholder="Location / URL" className="input-field flex-1 text-sm py-2" value={newDoc.location} onChange={e => setNewDoc({...newDoc, location: e.target.value})} />
          <button type="submit" className="btn-primary text-sm px-6">Add</button>
        </form>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Type</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Version</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                {editingId === doc.id ? (
                  <>
                    <td className="p-4"><input type="text" className="input-field w-full py-1 text-sm" value={editDoc.name || ''} onChange={e => setEditDoc({...editDoc, name: e.target.value})} /></td>
                    <td className="p-4"><input type="text" className="input-field w-full py-1 text-sm" value={editDoc.doc_type || ''} onChange={e => setEditDoc({...editDoc, doc_type: e.target.value})} /></td>
                    <td className="p-4"><input type="text" className="input-field w-full py-1 text-sm" value={editDoc.version || ''} onChange={e => setEditDoc({...editDoc, version: e.target.value})} /></td>
                    <td className="p-4"><input type="text" className="input-field w-full py-1 text-sm" value={editDoc.location || ''} onChange={e => setEditDoc({...editDoc, location: e.target.value})} /></td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <button onClick={() => saveEdit(doc.id)} className="text-emerald-600 font-medium text-sm hover:text-emerald-700">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-slate-500 font-medium text-sm hover:text-slate-700">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 font-semibold text-slate-800">{doc.name}</td>
                    <td className="p-4 text-sm text-slate-500">{doc.doc_type || '-'}</td>
                    <td className="p-4 text-sm text-slate-500 font-mono">{doc.version || '-'}</td>
                    <td className="p-4 text-sm text-blue-600 hover:underline cursor-pointer truncate max-w-xs">{doc.location || '-'}</td>
                    <td className="p-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(doc)} className="text-indigo-600 font-medium text-sm hover:text-indigo-800">Edit</button>
                      <button onClick={() => handleDelete(doc.id)} className="text-red-500 font-medium text-sm hover:text-red-700">Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {docs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p>No document items found.</p>
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
