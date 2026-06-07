import React, { useEffect, useState, useRef } from 'react';
import { parseInput } from './lib/parser';
import { LghFlow, LghState } from './lib/lghFlow';

function App() {
  const [dbStatus, setDbStatus] = useState<string>('checking...');
  const [items, setItems] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');

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
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'system', content: parsed.response }]);
    } else if (parsed.type === 'mark_this') {
      const newItem = await window.api.insertItem({
        type: parsed.explicitType || 'thought',
        content: parsed.content || 'Marked item',
        source: 'manual',
      });
      setItems((prev) => [...prev, newItem]);
    } else if (parsed.type === 'help') {
      const newItem = await window.api.insertItem({
        type: 'question',
        content: parsed.content,
        source: 'manual',
      });
      setItems((prev) => [...prev, newItem]);
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
    } else if (parsed.type === 'chat') {
      // Ordinary chat message
      setChatMessages((prev) => [...prev, { id: Date.now(), type: 'chat', content: parsed.content }]);
    }

    setInputValue('');
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 font-sans">
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Prompt D</h1>
        <div className="text-sm">
          DB: <span className={`font-semibold ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{dbStatus}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col space-y-8">
        <div className="flex-1 overflow-y-auto space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Logged Items (Grouped)</h2>
          {Object.keys(groupedItems).map((type) => (
            <div key={type} className="space-y-2">
              <h3 className="text-sm font-bold uppercase text-gray-500">{type}</h3>
              {groupedItems[type].map((item) => (
                <div key={item.id} className="p-3 bg-white rounded shadow-sm border border-gray-200">
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
      </main>

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
