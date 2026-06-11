import React from 'react';

type Tab = 'cover' | 'index' | 'dev_track' | 'outline' | 'context_register' | 'doc_register' | 'history' | 'appendix_a' | 'appendix_b' | 'appendix_c';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Navigation({ activeTab, setActiveTab }: Props) {
  const tabs: { id: Tab | 'chat', label: string }[] = [
    { id: 'cover', label: 'Cover' },
    { id: 'index', label: 'Index' },
    { id: 'dev_track', label: 'Dev Track' },
    { id: 'outline', label: 'Outline' },
    { id: 'chat', label: 'Chat' },
    { id: 'context_register', label: '[context] Register' },
    { id: 'doc_register', label: '[doc] Register' },
    { id: 'history', label: 'History' },
    { id: 'appendix_a', label: 'Appendix A' },
    { id: 'appendix_b', label: 'Appendix B' },
    { id: 'appendix_c', label: 'Appendix C' },
    { id: 'ongoing_sweep', label: 'Sweep' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex space-x-2 overflow-x-auto whitespace-nowrap shadow-sm z-10 sticky top-0">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
