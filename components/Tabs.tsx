import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-white">Tools</h2>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`w-full text-left py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
            activeTab === tab
              ? 'bg-white text-black'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};