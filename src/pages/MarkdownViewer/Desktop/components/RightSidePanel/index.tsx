import React, { useState } from 'react';
import { MessageSquare, FileText } from 'lucide-react';
import QuestionsPanel from './QuestionsPanel';
import NotesPanel from './NotesPanel';

const RightSidePanel = () => {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'notes'

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden w-full h-[calc(100vh-140px)] flex flex-col shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 px-4 py-3 font-quicksand text-sm flex items-center justify-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-gray-100 border-b-2 border-gray-800 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MessageSquare size={16} />
          <span>Ask Questions</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 px-4 py-3 font-quicksand text-sm flex items-center justify-center gap-2 ${
            activeTab === 'notes'
              ? 'bg-gray-100 border-b-2 border-gray-800 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FileText size={16} />
          <span>Notes</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {activeTab === 'questions' ? (
          <QuestionsPanel />
        ) : (
          <NotesPanel />
        )}
      </div>
    </div>
  );
};

export default RightSidePanel;