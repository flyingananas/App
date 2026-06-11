import React, { useState, useEffect } from 'react';

interface Props {
  settings: Record<string, string>;
  project: any;
  reloadSettings: () => Promise<void>;
}

export function Settings({ settings, project, reloadSettings }: Props) {
  const [aiEnabled, setAiEnabled] = useState(settings.ai_enabled === 'true');
  const [provider, setProvider] = useState<'gemini' | 'claude'>((settings.ai_provider as any) || 'gemini');

  const [geminiKey, setGeminiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasClaudeKey, setHasClaudeKey] = useState(false);

  const [geminiLight, setGeminiLight] = useState(settings.gemini_light || 'gemini-2.5-flash');
  const [geminiHeavy, setGeminiHeavy] = useState(settings.gemini_heavy || 'gemini-2.5-pro');
  const [claudeLight, setClaudeLight] = useState(settings.claude_light || 'claude-haiku-4-5');
  const [claudeHeavy, setClaudeHeavy] = useState(settings.claude_heavy || 'claude-sonnet-4-6');

  // feature toggles
  const [featContext, setFeatContext] = useState(settings.feat_context === 'true');
  const [featInferred, setFeatInferred] = useState(settings.feat_inferred === 'true');
  const [featCheckpoint, setFeatCheckpoint] = useState(settings.feat_checkpoint === 'true');
  const [featSystemCheck, setFeatSystemCheck] = useState(settings.feat_system_check === 'true');
  const [featSweep, setFeatSweep] = useState(settings.feat_sweep === 'true');

  const [projectName, setProjectName] = useState(project?.name || '');
  const [checkpointThreshold, setCheckpointThreshold] = useState(project?.checkpoint_threshold?.toString() || '15');
  const [sycThreshold, setSycThreshold] = useState(project?.syc_threshold?.toString() || '200');
  const [statusLabels, setStatusLabels] = useState(
    project?.status_labels ? JSON.parse(project.status_labels).join(', ') : ''
  );
  const [aiAutoApply, setAiAutoApply] = useState(project?.ai_auto_apply === 1);

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    window.api.hasAIKey('gemini').then(setHasGeminiKey);
    window.api.hasAIKey('claude').then(setHasClaudeKey);
  }, []);

  // Rules of Hooks: guard return must be after hooks
  if (!project) {
    return <div className="p-6 text-gray-500">Loading project settings...</div>;
  }

  const handleSaveSettings = async () => {
    await window.api.setSetting('ai_enabled', String(aiEnabled));
    await window.api.setSetting('ai_provider', provider);
    await window.api.setSetting('gemini_light', geminiLight);
    await window.api.setSetting('gemini_heavy', geminiHeavy);
    await window.api.setSetting('claude_light', claudeLight);
    await window.api.setSetting('claude_heavy', claudeHeavy);

    await window.api.setSetting('feat_context', String(featContext));
    await window.api.setSetting('feat_inferred', String(featInferred));
    await window.api.setSetting('feat_checkpoint', String(featCheckpoint));
    await window.api.setSetting('feat_system_check', String(featSystemCheck));
    await window.api.setSetting('feat_sweep', String(featSweep));

    if (geminiKey) {
      await window.api.setAIKey('gemini', geminiKey);
      setGeminiKey('');
      setHasGeminiKey(true);
    }
    if (claudeKey) {
      await window.api.setAIKey('claude', claudeKey);
      setClaudeKey('');
      setHasClaudeKey(true);
    }

    let labels = [];
    if (statusLabels.trim()) {
      labels = statusLabels.split(',').map(s => s.trim()).filter(s => s);
    }
    await window.api.updateProject(project.id, {
      name: projectName.trim() || project.name,
      checkpoint_threshold: parseInt(checkpointThreshold, 10) || 15,
      syc_threshold: parseInt(sycThreshold, 10) || 200,
      status_labels: JSON.stringify(labels),
      ai_auto_apply: aiAutoApply ? 1 : 0
    });

    await reloadSettings();
    setStatusMsg('Settings saved successfully.');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage global preferences, AI models, and project configurations.</p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg shadow-sm border border-emerald-200 flex items-center space-x-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span className="font-medium text-sm">{statusMsg}</span>
        </div>
      )}

      <div className="card p-6 space-y-6">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
          <span className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">Enable AI Features</span>
        </label>

        {aiEnabled && (
          <div className="pl-8 space-y-8 border-l-2 border-indigo-100 mt-4">

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800">Provider Selection</h3>
              <select className="input-field w-full max-w-xs" value={provider} onChange={e => setProvider(e.target.value as any)}>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 mb-1">API Keys</h3>
                <p className="text-xs text-slate-500 mb-4">Stored securely in your native OS Keychain. Never exposed to the renderer.</p>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Gemini API Key {hasGeminiKey && <span className="text-emerald-600 font-medium ml-2 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">✓ Stored</span>}</label>
                <input type="password" placeholder={hasGeminiKey ? "Enter new key to overwrite..." : "Paste Gemini API Key"}
                       className="input-field w-full" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Claude API Key {hasClaudeKey && <span className="text-emerald-600 font-medium ml-2 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">✓ Stored</span>}</label>
                <input type="password" placeholder={hasClaudeKey ? "Enter new key to overwrite..." : "Paste Claude API Key"}
                       className="input-field w-full" value={claudeKey} onChange={e => setClaudeKey(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Model Configuration</h3>
              {provider === 'gemini' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Light Tasks</label>
                    <input type="text" className="input-field w-full" value={geminiLight} onChange={e => setGeminiLight(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Heavy Reasoning</label>
                    <input type="text" className="input-field w-full" value={geminiHeavy} onChange={e => setGeminiHeavy(e.target.value)} />
                  </div>
                </div>
              )}
              {provider === 'claude' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Light Tasks</label>
                    <input type="text" className="input-field w-full" value={claudeLight} onChange={e => setClaudeLight(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700">Heavy Reasoning</label>
                    <input type="text" className="input-field w-full" value={claudeHeavy} onChange={e => setClaudeHeavy(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 mb-3">Feature Toggles</h3>
              <label className="flex items-center space-x-3 text-slate-700 cursor-pointer"><input type="checkbox" checked={featContext} onChange={e => setFeatContext(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span>Context auto-detection</span></label>
              <label className="flex items-center space-x-3 text-slate-700 cursor-pointer"><input type="checkbox" checked={featInferred} onChange={e => setFeatInferred(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span>Inferred logging (can also toggle via <code className="bg-slate-100 px-1 rounded text-xs">wmc</code> / <code className="bg-slate-100 px-1 rounded text-xs">rtw</code> cues)</span></label>
              <label className="flex items-center space-x-3 text-slate-700 cursor-pointer"><input type="checkbox" checked={featCheckpoint} onChange={e => setFeatCheckpoint(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span>Checkpoint synthesis</span></label>
              <label className="flex items-center space-x-3 text-slate-700 cursor-pointer"><input type="checkbox" checked={featSystemCheck} onChange={e => setFeatSystemCheck(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span>System Check AI evaluation</span></label>
              <label className="flex items-center space-x-3 text-slate-700 cursor-pointer"><input type="checkbox" checked={featSweep} onChange={e => setFeatSweep(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span>ONGOING Sweep capabilities</span></label>
            </div>

          </div>
        )}
      </div>

      <div className="flex justify-start">
        <button onClick={handleSaveSettings} className="btn-primary w-full sm:w-auto shadow-md">
          Save Global Settings
        </button>
      </div>

      <div className="card p-6 space-y-6 mt-12 border-indigo-100">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-lg text-slate-800">Project Settings</h3>
          <p className="text-xs text-slate-500 mt-1">These settings apply only to the active project.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">Project Name</label>
          <input type="text" className="input-field w-full max-w-sm" value={projectName} onChange={e => setProjectName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Checkpoint Threshold</label>
            <input type="number" className="input-field w-full" value={checkpointThreshold} onChange={e => setCheckpointThreshold(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">System Check Threshold</label>
            <input type="number" className="input-field w-full" value={sycThreshold} onChange={e => setSycThreshold(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">[context] Status Labels (comma-separated)</label>
          <input type="text" className="input-field w-full" value={statusLabels} onChange={e => setStatusLabels(e.target.value)} />
        </div>
        <div className="pt-3">
          <label className="flex items-center space-x-3 font-medium cursor-pointer text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input type="checkbox" checked={aiAutoApply} onChange={e => setAiAutoApply(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
            <span>Auto-apply AI suggestions (skips review card)</span>
          </label>
        </div>
      </div>

      <div className="card p-6 space-y-5 mt-12 bg-slate-50 border-dashed">
        <h3 className="font-bold text-lg text-slate-800 border-b border-slate-200 pb-2">Data Management</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={async () => {
              const data = await window.api.exportData();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'promptd-backup.json';
              a.click();
            }}
            className="btn-secondary"
          >
            Export JSON
          </button>

          <label className="btn-secondary cursor-pointer">
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (confirm('[integrity flag] Importing JSON will overwrite all current data. Proceed?')) {
                    const text = await file.text();
                    try {
                      await window.api.importData(text);
                      setStatusMsg('Data imported successfully. Reloading...');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (err: any) {
                      setStatusMsg(`Import failed: ${err.message}`);
                    }
                  }
                }
              }}
            />
          </label>

          <button
            onClick={async () => {
              const md = await window.api.exportMarkdown();
              const blob = new Blob([md], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'promptd-export.md';
              a.click();
            }}
            className="btn-secondary"
          >
            Export Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
