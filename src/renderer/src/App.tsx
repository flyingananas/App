import React, { useEffect, useState, useRef } from 'react';
import { parseInput } from './lib/parser';
import { LghFlow, LghState } from './lib/lghFlow';
import { Onboarding } from './components/Onboarding';
import { Navigation } from './components/Navigation';
import { Cover } from './components/Cover';
import { Index } from './components/Index';
import { DevTrack } from './components/DevTrack';
import { ContextRegister } from './components/ContextRegister';
import { DocRegister } from './components/DocRegister';
import { HistoryArchive } from './components/HistoryArchive';
import { AppendixA } from './components/AppendixA';
import { AppendixB } from './components/AppendixB';
import { AppendixC } from './components/AppendixC';
import { Settings } from './components/Settings';
import { OngoingSweep } from './components/OngoingSweep';

function App() {
  const [activeTab, setActiveTab] = useState<any>('outline');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<string>('checking...');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Checkpoint counter state
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [showCheckpointPrompt, setShowCheckpointPrompt] = useState(false);

  // lgh flow state
  const [lghFlow] = useState(() => new LghFlow());
  const [lghState, setLghState] = useState<LghState>('IDLE');
  const [lghPrompt, setLghPrompt] = useState<string>('');

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const isConnected = await window.api.pingDb();
        setDbStatus(isConnected ? 'connected' : 'not connected');
        if (isConnected) {
          const loadedSettings = await window.api.getSettings();
          setSettings(loadedSettings);
          if (!loadedSettings.project_name) {
            setOnboardingComplete(false);
          }

          const loadedItems = await window.api.getItems();
          setItems(loadedItems);
        }
      } catch (err) {
        console.error(err);
        setDbStatus('error');
      }
    }
    init();
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, lghPrompt]);

  useEffect(() => {
    if (activeTab === 'outline' && focusedItemId) {
      const el = document.getElementById(`item-${focusedItemId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setFocusedItemId(null), 2000);
      }
    }
  }, [activeTab, focusedItemId]);

  const incrementItemCount = () => {
    setNewItemsCount((prev) => {
      const next = prev + 1;
      const threshold = parseInt(settings.checkpoint_threshold || '15', 10);
      if (next >= threshold) {
        setShowCheckpointPrompt(true);
      }
      return next;
    });

    const total = items.length + 1;
    const sycThreshold = parseInt(settings.syc_threshold || '200', 10);
    if (total > 0 && total % sycThreshold === 0) {
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `This is your ${sycThreshold}-entry system check. Is now a good time? You can also adjust the threshold — keep at ${sycThreshold}, increase, or decrease.
1. What is working as designed?
2. What is being used differently — better or worse?
3. What keeps being worked around?
4. What rule has drifted or is applied inconsistently?` }]);
    }
  };

  const handleCheckpointConfirm = async () => {
    let content = 'Checkpoint generated: Threads not resolved/parked. Assumptions unexamined. Context scan. Items logged summary. Untouched docs.';

    if (settings.ai_enabled === 'true' && settings.feat_checkpoint === 'true') {
      try {
        const provider = (settings.ai_provider as 'gemini' | 'claude') || 'gemini';
        const model = settings[`${provider}_heavy`] || 'gemini-2.5-pro';
        const prompt = `You are a project manager. Write a concise prose checkpoint summary (a paragraph) based on the recent project activity. Address: unresolved threads, unexamined assumptions, current context, recent items logged, and untouched docs.
Recent items: ${JSON.stringify(items.slice(-15).map(i => i.content))}`;
        content = await window.api.generateAI(prompt, { provider, model });
      } catch (err: any) {
        setChatMessages(prev => [...prev, { id: Date.now(), type: 'system', content: `[integrity flag] Checkpoint AI failed (${err.message}). Falling back to manual.` }]);
      }
    }

    // Generate checkpoint record
    await window.api.insertItem({
      type: 'condensed',
      content,
      source: 'manual'
    });
    setNewItemsCount(0);
    setShowCheckpointPrompt(false);
    const loadedItems = await window.api.getItems();
    setItems(loadedItems);
  };

  const loadItems = async () => {
    const loadedItems = await window.api.getItems();
    setItems(loadedItems);
  };

  const handleNavigateToOutline = (id?: string) => {
    if (id) {
      setFocusedItemId(id);
    }
    setActiveTab('outline');
  };

  const runContextAutoDetection = async (itemContent: string) => {
    if (settings.ai_enabled === 'true' && settings.feat_context === 'true') {
      try {
        const provider = (settings.ai_provider as 'gemini' | 'claude') || 'gemini';
        const model = settings[`${provider}_light`] || 'gemini-2.5-flash';
        const prompt = `Analyze this message: "${itemContent}". Extract any named people, events, anecdotes, or biographical details that should be logged as context. Return ONLY a single string of the extracted context, or exactly "NONE" if nothing qualifies.`;
        const result = await window.api.generateAI(prompt, { provider, model });
        if (result && result.trim() !== 'NONE') {
          setChatMessages(prev => [...prev, { id: Date.now(), type: 'system', content: `[AI Suggestion] Propose logging [context]: ${result.trim()}` }]);
        }
      } catch (err: any) {
        console.error('Context detection failed:', err);
      }
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (lghState !== 'IDLE') {
      const result = lghFlow.processInput(inputValue);
      setLghState(result.state);
      if (result.prompt) {
        setLghPrompt(result.prompt);
      }
      if (result.completedData) {
        await window.api.insertDevTrack(result.completedData);
        setLghPrompt('Logged dev track successfully.');
        setTimeout(() => { setLghPrompt(''); setLghState('IDLE'); }, 2000);
      }
      setInputValue('');
      return;
    }

    const parsed = parseInput(inputValue);

    if (parsed.type === 'log_hours') {
      const lastTrack = await window.api.getLastDevTrack();
      const lastDate = lastTrack?.work_date;
      const start = lghFlow.startFlow(lastDate);
      setLghState(start.state);
      setLghPrompt(start.prompt);
    } else if (parsed.type === 'log') {
      const newItem = await window.api.insertItem({
        type: parsed.itemType,
        content: parsed.content,
        source: 'manual',
      });
      setItems((prev) => [...prev, newItem]);
      incrementItemCount();
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: parsed.response }]);
      runContextAutoDetection(parsed.content);
    } else if (parsed.type === 'mark_this') {
      const newItem = await window.api.insertItem({
        type: parsed.explicitType || 'thought',
        content: parsed.content || 'Marked item',
        source: 'manual',
      });
      setItems((prev) => [...prev, newItem]);
      incrementItemCount();
      runContextAutoDetection(parsed.content);
    } else if (parsed.type === 'help') {
      const newItem = await window.api.insertItem({
        type: 'question',
        content: parsed.content,
        source: 'manual',
      });
      setItems((prev) => [...prev, newItem]);
      incrementItemCount();
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: 'Help requested: Here is a help area.' }]);
    } else if (parsed.type === 'action') {
      const ok = await window.api.activateItemByText(parsed.content);
      if (ok) {
        setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `Activated item matching: ${parsed.content}` }]);
        // refresh items
        const loadedItems = await window.api.getItems();
        setItems(loadedItems);
      } else {
        setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `Could not find item to activate: ${parsed.content}` }]);
      }
    } else if (parsed.type === 'park_thread') {
      await window.api.updateThreadState('parked');
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: 'Thread parked.' }]);
    } else if (parsed.type === 'return_parked') {
      await window.api.updateThreadState('active');
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: 'Returned to parked thread.' }]);
    } else if (parsed.type === 'query_code') {
      const codes = [
        { code: 'drp', full: 'drop:', desc: 'Log silently. Reply "noted". Auto-timestamp.' },
        { code: 'hlp', full: 'assist:', desc: 'Log AND help immediately.' },
        { code: 'ida', full: 'idea:', desc: 'Log as an idea worth developing.' },
        { code: 'act', full: 'action:', desc: 'Activate a specific logged item by matching.' },
        { code: 'lgh', full: 'log hours', desc: 'Four-question work-block log.' },
        { code: 'mth', full: 'mark this', desc: 'Add current point to outline immediately.' },
        { code: 'mta', full: 'mark this as [x]', desc: 'Add with explicit item type.' },
        { code: 'pth', full: 'park this', desc: 'Manually park the current thread.' },
        { code: 'rtp', full: 'return to parked', desc: 'Resume a parked thread.' },
        { code: 'wmc', full: 'watch my threads closely today', desc: 'Activate thread watch + inferred logging.' },
        { code: 'rtw', full: 'relax thread watch', desc: 'Return to silent mode.' },
        { code: 'syc', full: 'system check', desc: 'Self-assessment.' },
      ];
      const found = codes.find(c => c.code === parsed.code || c.full.startsWith(parsed.code));
      const msg = found
        ? `${found.full} - ${found.desc} (type ?codes or ??? for the full list.)`
        : `Unknown code: ${parsed.code} (type ?codes or ??? for the full list.)`;
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: msg }]);
    } else if (parsed.type === 'query_all_codes') {
      setActiveTab('appendix_b');
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `Opened full inline glossary (Appendix B).` }]);
    } else if (parsed.type === 'watch_threads') {
      await window.api.setSetting('feat_inferred', 'true');
      setSettings(prev => ({...prev, feat_inferred: 'true'}));
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `Thread watch activated (Inferred logging ON).` }]);
    } else if (parsed.type === 'relax_watch') {
      await window.api.setSetting('feat_inferred', 'false');
      setSettings(prev => ({...prev, feat_inferred: 'false'}));
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `Thread watch relaxed (Inferred logging OFF).` }]);
    } else if (parsed.type === 'system_check') {
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: `System Check Initiated.
1. What is working as designed?
2. What is being used differently — better or worse?
3. What keeps being worked around?
4. What rule has drifted or is applied inconsistently?` }]);
    } else if (parsed.type === 'chat') {
      // Inferred logging
      if (settings.ai_enabled === 'true' && settings.feat_inferred === 'true') {
        const newItem = await window.api.insertItem({
          type: 'thought',
          content: parsed.content,
          source: 'inferred',
        });
        setItems((prev) => [...prev, newItem]);
        incrementItemCount();
        setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: 'noted (inferred)' }]);
        runContextAutoDetection(parsed.content);
      } else {
        // Ordinary chat message
        setChatMessages((prev) => [...prev, { id: Date.now(), type: 'chat', content: parsed.content }]);
      }
    }

    setInputValue('');
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const handleOnboardingComplete = async () => {
    const loadedSettings = await window.api.getSettings();
    setSettings(loadedSettings);
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Prompt D</h1>
        <div className="text-sm">
          DB: <span className={`font-semibold ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{dbStatus}</span>
        </div>
      </header>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'cover' && <Cover settings={settings} />}
        {activeTab === 'index' && <Index setActiveTab={setActiveTab} />}
        {activeTab === 'dev_track' && <DevTrack />}
        {activeTab === 'context_register' && (
          <ContextRegister
            items={items}
            refreshItems={loadItems}
            statusLabels={settings.status_labels ? JSON.parse(settings.status_labels) : []}
          />
        )}
        {activeTab === 'doc_register' && <DocRegister />}
        {activeTab === 'history' && <HistoryArchive />}
        {activeTab === 'appendix_a' && <AppendixA items={items} onNavigateToOutline={handleNavigateToOutline} />}
        {activeTab === 'appendix_b' && <AppendixB />}
        {activeTab === 'appendix_c' && <AppendixC />}
        {activeTab === 'ongoing_sweep' && <OngoingSweep settings={settings} onExtract={loadItems} />}
        {activeTab === 'settings' && <Settings settings={settings} reloadSettings={async () => { const s = await window.api.getSettings(); setSettings(s); }} />}
        {activeTab === 'outline' && (
          <div className="p-4 flex flex-col space-y-8 h-full">
            <div className="flex-1 overflow-y-auto space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Logged Items (Grouped)</h2>
              {Object.keys(groupedItems).map((type) => (
                <div key={type} className="space-y-2">
                  <h3 className="text-sm font-bold uppercase text-gray-500">{type}</h3>
                  {groupedItems[type].map((item) => (
                    <div key={item.id} id={`item-${item.id}`} className={`p-3 rounded shadow-sm border ${focusedItemId === item.id ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'} transition-colors duration-500`}>
                      <div className="text-sm">{item.content}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <h2 className="text-lg font-bold">Chat</h2>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded text-sm ${msg.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.content}
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>
          </div>
        )}
      </main>

      {showCheckpointPrompt && (
        <div className="p-4 bg-yellow-100 border-t border-b border-yellow-300 flex justify-between items-center">
          <span className="text-yellow-800 font-medium">15+ items logged. Ready for a checkpoint?</span>
          <div className="space-x-2">
            <button onClick={() => setShowCheckpointPrompt(false)} className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300">Skip</button>
            <button onClick={handleCheckpointConfirm} className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">Confirm Checkpoint</button>
          </div>
        </div>
      )}

      <footer className="p-4 bg-white shadow-inner flex flex-col space-y-2">
        {lghState !== 'IDLE' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded shadow-sm text-blue-800 mb-2">
            <strong>Log Hours:</strong> {lghPrompt}
          </div>
        )}
        {lghState === 'IDLE' && lghPrompt && (
          <div className="p-2 text-sm text-green-600 italic">{lghPrompt}</div>
        )}
        <form onSubmit={handleInputSubmit} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message or command (e.g., 'drp: thought', 'lgh')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
