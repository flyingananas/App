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
    } catch (err: any) {
      setStatus(`Analysis failed: ${err.message}`);
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
      <div className="p-6 max-w-4xl mx-auto text-center mt-20">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 mb-2">ONGOING Sweep Disabled</h2>
        <p className="text-slate-500">AI features or the ONGOING sweep functionality are currently disabled in Settings.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">ONGOING Sweep</h2>
        <p className="text-sm text-slate-500 mt-1">Analyze a pasted transcript to automatically extract structured items.</p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="block font-semibold text-slate-700 mb-2">Is there anything in this conversation you want me to treat with particular care, or flag if compression seems unavoidable?</label>
          <input type="text" className="input-field w-full" value={priorities} onChange={e => setPriorities(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-2">Are there any documents, decisions, or named references you consider load-bearing that I should prioritise?</label>
          <input type="text" className="input-field w-full" value={loadBearing} onChange={e => setLoadBearing(e.target.value)} />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-2">Paste transcript here:</label>
          <textarea className="input-field w-full h-48 resize-none leading-relaxed font-mono text-sm" value={transcript} onChange={e => setTranscript(e.target.value)}></textarea>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button onClick={handleSweep} className="btn-primary flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            <span>Run Sweep Analysis</span>
          </button>
          {status && <span className="text-sm font-medium text-indigo-600 animate-pulse">{status}</span>}
        </div>
      </div>

      {results.length > 0 && (
        <div className="card p-6 bg-slate-50 space-y-4 border-indigo-200">
          <h3 className="font-bold text-lg text-slate-800">Extracted Items for Review</h3>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li key={i} className="flex space-x-3 items-start bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded tracking-wider shrink-0 mt-0.5">[{r.type}]</span>
                <span className="text-sm text-slate-700 leading-relaxed">{r.content}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4 border-t border-slate-200">
            <button onClick={commitResults} className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
              Commit Items to Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
