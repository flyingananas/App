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
      await window.api.setSetting('mode', 'NEW');
      setStep(2);
    } else if (step === 2) {
      let labels = [];
      if (statusLabels.trim()) {
        labels = statusLabels.split(',').map(s => s.trim()).filter(s => s);
      } else {
        // default suggestions
        labels = ['todo', 'in-progress', 'done', 'blocked'];
      }
      const project = await window.api.createProject(projectName.trim(), labels);
      await window.api.setSetting('active_project_id', project.id);
      onComplete();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 font-sans">
      <div className="card p-10 max-w-md w-full shadow-lg border-slate-200">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-8 text-center">
          {step === 1 ? 'Welcome to Prompt D' : 'Context Labels'}
        </h2>

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-slate-600 font-medium">What is the project name for this session?</p>
            <input
              autoFocus
              type="text"
              className="input-field w-full py-3"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Project Alpha"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="text-slate-600 font-medium leading-relaxed">
              Would you like to set status labels for your <span className="font-mono text-sm bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">[context]</span> register?
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Provide a comma-separated list, or leave blank to use defaults (todo, in-progress, done, blocked).
            </p>
            <input
              autoFocus
              type="text"
              className="input-field w-full py-3"
              value={statusLabels}
              onChange={(e) => setStatusLabels(e.target.value)}
              placeholder="e.g. active, waiting, completed"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          </div>
        )}

        <div className="mt-10 flex justify-end items-center space-x-4">
          {step === 2 && (
            <button
              onClick={() => {
                setStatusLabels('');
                handleNext();
              }}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Skip
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-primary w-full sm:w-auto"
            disabled={step === 1 && !projectName.trim()}
          >
            {step === 1 ? 'Continue →' : 'Finish Setup'}
          </button>
        </div>
      </div>
    </div>
  );
}
