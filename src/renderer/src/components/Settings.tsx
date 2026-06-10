import React, { useState, useEffect } from 'react';

interface Props {
  settings: Record<string, string>;
  project: any;
  reloadSettings: () => Promise<void>;
}

export function Settings({ settings, project, reloadSettings }: Props) {
  if (!project) {
    return <div className="p-6 text-gray-500">Loading project settings...</div>;
  }

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

  const [projectName, setProjectName] = useState(project.name || '');
  const [checkpointThreshold, setCheckpointThreshold] = useState(project.checkpoint_threshold?.toString() || '15');
  const [sycThreshold, setSycThreshold] = useState(project.syc_threshold?.toString() || '200');
  const [statusLabels, setStatusLabels] = useState(
    project.status_labels ? JSON.parse(project.status_labels).join(', ') : ''
  );
  const [aiAutoApply, setAiAutoApply] = useState(project.ai_auto_apply === 1);

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    window.api.hasAIKey('gemini').then(setHasGeminiKey);
    window.api.hasAIKey('claude').then(setHasClaudeKey);
  }, []);

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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2">Settings</h2>

      {statusMsg && <div className="p-2 bg-green-100 text-green-800 rounded">{statusMsg}</div>}

      <div className="bg-white p-4 rounded shadow-sm border space-y-4">
        <label className="flex items-center space-x-2 font-bold text-lg cursor-pointer">
          <input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} className="w-5 h-5" />
          <span>Enable AI Features</span>
        </label>

        {aiEnabled && (
          <div className="pl-6 space-y-6 border-l-2 border-blue-200 mt-4">

            <div className="space-y-2">
              <h3 className="font-bold text-gray-700">Provider Selection</h3>
              <select className="border p-2 rounded" value={provider} onChange={e => setProvider(e.target.value as any)}>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-700">API Keys (Stored securely in OS Keychain)</h3>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Gemini API Key {hasGeminiKey && <span className="text-green-600">(Stored)</span>}</label>
                <input type="password" placeholder={hasGeminiKey ? "Enter new key to overwrite..." : "Paste Gemini API Key"}
                       className="border p-2 rounded" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium">Claude API Key {hasClaudeKey && <span className="text-green-600">(Stored)</span>}</label>
                <input type="password" placeholder={hasClaudeKey ? "Enter new key to overwrite..." : "Paste Claude API Key"}
                       className="border p-2 rounded" value={claudeKey} onChange={e => setClaudeKey(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-700">Model Configuration</h3>
              {provider === 'gemini' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Light Tasks</label>
                    <input type="text" className="border p-2 rounded w-full" value={geminiLight} onChange={e => setGeminiLight(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Heavy Reasoning</label>
                    <input type="text" className="border p-2 rounded w-full" value={geminiHeavy} onChange={e => setGeminiHeavy(e.target.value)} />
                  </div>
                </div>
              )}
              {provider === 'claude' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Light Tasks</label>
                    <input type="text" className="border p-2 rounded w-full" value={claudeLight} onChange={e => setClaudeLight(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Heavy Reasoning</label>
                    <input type="text" className="border p-2 rounded w-full" value={claudeHeavy} onChange={e => setClaudeHeavy(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-gray-700">Feature Toggles</h3>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={featContext} onChange={e => setFeatContext(e.target.checked)} /><span>Context auto-detection</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={featInferred} onChange={e => setFeatInferred(e.target.checked)} /><span>Inferred logging (can also toggle via wmc/rtw cues)</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={featCheckpoint} onChange={e => setFeatCheckpoint(e.target.checked)} /><span>Checkpoint synthesis</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={featSystemCheck} onChange={e => setFeatSystemCheck(e.target.checked)} /><span>System Check AI evaluation</span></label>
              <label className="flex items-center space-x-2"><input type="checkbox" checked={featSweep} onChange={e => setFeatSweep(e.target.checked)} /><span>ONGOING Sweep capabilities</span></label>
            </div>

          </div>
        )}
      </div>

      <button onClick={handleSaveSettings} className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700">
        Save Settings
      </button>

      <div className="bg-white p-4 rounded shadow-sm border mt-8 space-y-4">
        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Project Settings</h3>
        <div>
          <label className="block text-sm font-medium">Project Name</label>
          <input type="text" className="border p-2 rounded w-full max-w-sm" value={projectName} onChange={e => setProjectName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Checkpoint Threshold</label>
            <input type="number" className="border p-2 rounded w-full" value={checkpointThreshold} onChange={e => setCheckpointThreshold(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">System Check Threshold</label>
            <input type="number" className="border p-2 rounded w-full" value={sycThreshold} onChange={e => setSycThreshold(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">[context] Status Labels (comma-separated)</label>
          <input type="text" className="border p-2 rounded w-full" value={statusLabels} onChange={e => setStatusLabels(e.target.value)} />
        </div>
        <div className="pt-2">
          <label className="flex items-center space-x-2 font-medium cursor-pointer">
            <input type="checkbox" checked={aiAutoApply} onChange={e => setAiAutoApply(e.target.checked)} className="w-4 h-4" />
            <span>Auto-apply AI suggestions (skips review card)</span>
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-sm border mt-8">
        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Data Management</h3>
        <div className="flex space-x-4">
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
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Export JSON
          </button>

          <label className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 cursor-pointer">
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
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          >
            Export Markdown
          </button>
        </div>
      </div>
    </div>
  );
}
