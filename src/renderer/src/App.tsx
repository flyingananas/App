import React, { useEffect, useState } from 'react';

function App() {
  const [dbStatus, setDbStatus] = useState<string>('checking...');

  useEffect(() => {
    async function checkDb() {
      try {
        const isConnected = await window.api.pingDb();
        setDbStatus(isConnected ? 'connected' : 'not connected');
      } catch (err) {
        console.error(err);
        setDbStatus('error');
      }
    }
    checkDb();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Prompt D</h1>
      <p className="text-lg">
        Database connection status: <span className={`font-semibold ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>{dbStatus}</span>
      </p>
    </div>
  );
}

export default App;
