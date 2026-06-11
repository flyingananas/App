import React, { useState } from 'react';

interface Props {
  settings: Record<string, string>;
  onExtract: (items: any[]) => void;
}

export function OngoingSweep({ settings, onExtract }: Props) {
  const [transcript, setTranscript] = useState('');
  const [priorities, setPriorities] = useState('');
  const [loadBearing, setLoadBearing] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const aiEnabled = settings.ai_enabled === 'true';
  const sweepEnabled = settings.feat_sweep === 'true';

  const handleSweep = async () => {
    if (!transcript.trim()) return;
    setStatus('Analyzing transcript...');
    try {
      const provider = (settings.ai_provider as 'gemini' | 'claude') || 'gemini';
      const model = settings[`${provider}_heavy`] || 'gemini-2.5-pro';

      const prompt = `You are a transcript analyzer. Analyze the following transcript.
Active context priorities: ${priorities}
Load-bearing documents/decisions: ${loadBearing}

Extract [context], [doc], [resolved], and [decision] items from the transcript.
Return ONLY valid JSON in this format:
[
  { "type": "context", "content": "..." },
  { "type": "doc", "content": "..." }
]

Transcript:
${transcript}`;

      const aiResponse = await window.api.generateAI(prompt, { model, provider });
      const parsed = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
      setResults(parsed);
      setStatus('Analysis complete.');
    } catch (err: unknown) {
      setStatus(`Analysis failed: ${(err as Error).message}`);
    }
  };

  const commitResults = async () => {
    setStatus('Saving...');
    for (const res of results) {
      await window.api.insertItem({ type: res.type, content: res.content, source: 'inferred' });
    }
    setResults([]);
    setTranscript('');
    setPriorities('');
    setLoadBearing('');
    setStatus('Saved to database successfully.');
    onExtract(results);
    setTimeout(() => setStatus(''), 3000);
  };

  if (!aiEnabled || !sweepEnabled) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">ONGOING Sweep</h2>
        <p className="text-gray-500">AI features or ONGOING sweep are disabled in Settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">ONGOING Sweep</h2>

      <div className="space-y-4 bg-white p-4 border rounded shadow-sm">
        <div>
          <label className="block font-medium mb-1">Is there anything in this conversation you want me to treat with particular care, or flag if compression seems unavoidable?</label>
          <input type="text" className="w-full border p-2 rounded" value={priorities} onChange={e => setPriorities(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Are there any documents, decisions, or named references you consider load-bearing that I should prioritise?</label>
          <input type="text" className="w-full border p-2 rounded" value={loadBearing} onChange={e => setLoadBearing(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium mb-1">Paste transcript here:</label>
          <textarea className="w-full border p-2 rounded h-40" value={transcript} onChange={e => setTranscript(e.target.value)}></textarea>
        </div>
        <button onClick={handleSweep} className="bg-blue-600 text-white px-4 py-2 rounded">Run Sweep</button>
      </div>

      {status && <div className="text-sm font-medium text-blue-600">{status}</div>}

      {results.length > 0 && (
        <div className="space-y-4 bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-bold text-lg">Extracted Items for Review</h3>
          <ul className="space-y-2">
            {results.map((r, i) => (
              <li key={i} className="flex space-x-2 items-start bg-white p-2 border rounded">
                <span className="font-mono text-xs uppercase bg-gray-200 px-1 py-0.5 rounded">[{r.type}]</span>
                <span className="text-sm">{r.content}</span>
              </li>
            ))}
          </ul>
          <button onClick={commitResults} className="bg-green-600 text-white px-4 py-2 rounded">Commit Items to Log</button>
        </div>
      )}
    </div>
  );
}
