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
    } catch (err: unknown) {
      alert(`[integrity flag] ${(err as Error).message}`);
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">[doc] Register</h2>

      <form onSubmit={handleAdd} className="mb-6 flex space-x-2">
        <input type="text" placeholder="Name" className="border p-2 rounded" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} required />
        <input type="text" placeholder="Type" className="border p-2 rounded" value={newDoc.doc_type} onChange={e => setNewDoc({...newDoc, doc_type: e.target.value})} />
        <input type="text" placeholder="Version" className="border p-2 rounded w-24" value={newDoc.version} onChange={e => setNewDoc({...newDoc, version: e.target.value})} />
        <input type="text" placeholder="Location" className="flex-1 border p-2 rounded" value={newDoc.location} onChange={e => setNewDoc({...newDoc, location: e.target.value})} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="p-2">Name</th>
            <th className="p-2">Type</th>
            <th className="p-2">Version</th>
            <th className="p-2">Location</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
              {editingId === doc.id ? (
                <>
                  <td className="p-2"><input type="text" className="border w-full p-1" value={editDoc.name || ''} onChange={e => setEditDoc({...editDoc, name: e.target.value})} /></td>
                  <td className="p-2"><input type="text" className="border w-full p-1" value={editDoc.doc_type || ''} onChange={e => setEditDoc({...editDoc, doc_type: e.target.value})} /></td>
                  <td className="p-2"><input type="text" className="border w-full p-1" value={editDoc.version || ''} onChange={e => setEditDoc({...editDoc, version: e.target.value})} /></td>
                  <td className="p-2"><input type="text" className="border w-full p-1" value={editDoc.location || ''} onChange={e => setEditDoc({...editDoc, location: e.target.value})} /></td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => saveEdit(doc.id)} className="text-green-600 underline text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-gray-600 underline text-sm">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-2 font-medium">{doc.name}</td>
                  <td className="p-2 text-sm text-gray-600">{doc.doc_type || '-'}</td>
                  <td className="p-2 text-sm text-gray-600">{doc.version || '-'}</td>
                  <td className="p-2 text-sm text-gray-600">{doc.location || '-'}</td>
                  <td className="p-2 space-x-2">
                    <button onClick={() => startEdit(doc)} className="text-blue-600 underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(doc.id)} className="text-red-600 underline text-sm">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {docs.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">No doc items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
