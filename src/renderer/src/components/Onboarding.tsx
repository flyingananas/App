import React, { useState } from 'react';

interface Props {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [statusLabels, setStatusLabels] = useState('');

  const handleNext = async () => {
    if (step === 1) {
      if (!projectName.trim()) return;
      await window.api.setSetting('project_name', projectName.trim());
      setStep(2);
    } else if (step === 2) {
      let labels = [];
      if (statusLabels.trim()) {
        labels = statusLabels.split(',').map(s => s.trim()).filter(s => s);
      } else {
        // default suggestions
        labels = ['todo', 'in-progress', 'done', 'blocked'];
      }
      await window.api.setSetting('status_labels', JSON.stringify(labels));
      onComplete();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {step === 1 ? 'Welcome to Prompt D' : 'Status Labels'}
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600">What is the project name for this session?</p>
            <input
              autoFocus
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Project Alpha"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Would you like to set status labels for your <code>[context]</code> register?
            </p>
            <p className="text-sm text-gray-500">
              Provide a comma-separated list, or leave blank to use defaults (todo, in-progress, done, blocked).
            </p>
            <input
              autoFocus
              type="text"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusLabels}
              onChange={(e) => setStatusLabels(e.target.value)}
              placeholder="e.g. active, waiting, completed"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          {step === 2 && (
            <button
              onClick={() => {
                setStatusLabels('');
                handleNext();
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={step === 1 && !projectName.trim()}
          >
            {step === 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}
