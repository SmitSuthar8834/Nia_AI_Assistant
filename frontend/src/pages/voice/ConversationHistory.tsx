import React from 'react';

const ConversationHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your past voice interactions
        </p>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <div className="text-gray-500">Conversation History coming soon...</div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;