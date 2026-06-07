import React, { useState, useEffect } from 'react';

interface Props {
  settings: Record<string, string>;
  reloadSettings: () => Promise<void>;
}

export function Settings({ settings, reloadSettings }: Props) {
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
    </div>
  );
}
