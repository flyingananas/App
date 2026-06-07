import React, { useEffect, useState } from 'react';

export function DevTrack() {
  const [tracks, setTracks] = useState<any[]>([]);

  useEffect(() => {
    window.api.getDevTracks().then(setTracks);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Project Development Track</h2>
      <div className="space-y-4">
        {tracks.map(track => (
          <div key={track.id} className="p-4 bg-white border border-gray-200 rounded shadow-sm">
            <div className="font-bold border-b pb-2 mb-2">{track.work_date} - {track.duration}</div>
            <div><strong>Items:</strong> {track.items_worked}</div>
            {track.notes && <div><strong>Notes:</strong> {track.notes}</div>}
          </div>
        ))}
        {tracks.length === 0 && <p className="text-gray-500">No dev track entries yet.</p>}
      </div>
    </div>
  );
}
