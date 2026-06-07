import React from 'react';

type Tab = 'cover' | 'index' | 'dev_track' | 'outline' | 'context_register' | 'doc_register' | 'history' | 'appendix_a' | 'appendix_b' | 'appendix_c';

interface Props {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Navigation({ activeTab, setActiveTab }: Props) {
  const tabs: { id: Tab, label: string }[] = [
    { id: 'cover', label: 'Cover' },
    { id: 'index', label: 'Index' },
    { id: 'dev_track', label: 'Dev Track' },
    { id: 'outline', label: 'Outline' },
    { id: 'context_register', label: '[context] Register' },
    { id: 'doc_register', label: '[doc] Register' },
    { id: 'history', label: 'History' },
    { id: 'appendix_a', label: 'Appendix A' },
    { id: 'appendix_b', label: 'Appendix B' },
    { id: 'appendix_c', label: 'Appendix C' },
  ];

  return (
    <nav className="bg-gray-800 text-white p-2 flex space-x-2 overflow-x-auto whitespace-nowrap">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-3 py-1 rounded text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
