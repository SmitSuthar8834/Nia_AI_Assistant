import React, { useState, useCallback } from 'react';

export interface Tab {
  id: string;
  title: string;
  component: React.ComponentType;
  closable?: boolean;
}

interface TabManagerProps {
  initialTabs?: Tab[];
  className?: string;
}

export const TabManager: React.FC<TabManagerProps> = ({ 
  initialTabs = [], 
  className = '' 
}) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string>(
    initialTabs.length > 0 ? initialTabs[0].id : ''
  );

  const addTab = useCallback((tab: Tab) => {
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 cursor-pointer border-b-2 ${
              activeTabId === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span>{tab.title}</span>
            {tab.closable && (
              <button
                className="ml-2 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab && <activeTab.component />}
      </div>
    </div>
  );
};

export const useTabManager = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  const addTab = useCallback((tab: Tab) => {
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      }
      return newTabs;
    });
  }, [activeTabId]);

  return {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTabId
  };
};