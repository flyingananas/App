import React from 'react';

interface Props {
  setActiveTab: (t: any) => void;
}

export function Index({ setActiveTab }: Props) {
  const tabs = [
    { id: 'cover', label: 'Cover' },
    { id: 'dev_track', label: 'Project Development Track' },
    { id: 'outline', label: 'Outline' },
    { id: 'context_register', label: '[context] Register' },
    { id: 'doc_register', label: '[doc] Register' },
    { id: 'history', label: 'History / Archive' },
    { id: 'appendix_a', label: 'Appendix A (Cross-Reference)' },
    { id: 'appendix_b', label: 'Appendix B (Glossary)' },
    { id: 'appendix_c', label: 'Appendix C (Version History)' },
    { id: 'ongoing_sweep', label: 'ONGOING Sweep' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Index</h2>
      <ul className="space-y-2">
        {tabs.map(tab => (
          <li key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className="text-blue-600 hover:underline"
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
