import React, { useEffect, useState } from 'react';

export function DevTrack() {
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    window.api.getDevTracks().then(setTracks);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Project Development Track</h2>
        <p className="text-sm text-slate-500 mt-1">Logged work blocks and billable hours tracking.</p>
      </div>

      <div className="space-y-4">
        {tracks.map(track => (
          <div key={track.id} className="card p-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <div className="font-semibold text-slate-800 text-lg">{new Date(track.work_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
              <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold tracking-wide">{track.duration}</div>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex">
                <span className="font-medium text-slate-500 w-20">Items:</span>
                <span className="flex-1 leading-relaxed">{track.items_worked}</span>
              </div>
              {track.notes && (
                <div className="flex">
                  <span className="font-medium text-slate-500 w-20">Notes:</span>
                  <span className="flex-1 leading-relaxed italic">{track.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {tracks.length === 0 && (
          <div className="text-center p-12 card border-dashed">
            <p className="text-slate-500 font-medium">No dev track entries yet.</p>
            <p className="text-sm text-slate-400 mt-1">Use the <code className="bg-slate-100 px-1 rounded text-slate-600">lgh</code> command to start logging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
