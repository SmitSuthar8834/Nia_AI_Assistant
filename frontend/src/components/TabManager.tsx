import React, { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';

export interface Tab {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  closable?: boolean;
  icon?: React.ComponentType<any>;
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
    // Check if tab already exists
    const existingTab = tabs.find(t => t.id === tab.id);
    if (existingTab) {
      setActiveTabId(tab.id);
      return;
    }

    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, [tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If we're closing the active tab, switch to another tab
      if (tabId === activeTabId && newTabs.length > 0) {
        const currentIndex = prev.findIndex(tab => tab.id === tabId);
        const nextTab = newTabs[Math.max(0, currentIndex - 1)];
        setActiveTabId(nextTab.id);
      }
      
      return newTabs;
    });
  }, [activeTabId]);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-100 border-b border-gray-200 px-4">
        <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTabId;
            
            return (
              <div
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg cursor-pointer transition-colors min-w-0 ${
                  isActive
                    ? 'bg-white border-t border-l border-r border-gray-200 text-blue-600'
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm font-medium truncate">{tab.title}</span>
                
                {tab.closable !== false && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="ml-2 p-1 rounded hover:bg-gray-300 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Add Tab Button */}
        <button
          className="ml-2 p-2 rounded hover:bg-gray-200 text-gray-500"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab ? (
          <div className="h-full">
            <activeTab.component {...(activeTab.props || {})} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tabs open</p>
              <p className="text-sm">Click on navigation items to open tabs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Context for tab management
export const TabContext = React.createContext<{
  addTab: (tab: Tab) => void;
  closeTab: (tabId: string) => void;
  activeTabId: string;
}>({
  addTab: () => {},
  closeTab: () => {},
  activeTabId: ''
});

export const useTabManager = () => {
  const context = React.useContext(TabContext);
  if (!context) {
    throw new Error('useTabManager must be used within TabContext');
  }
  return context;
};