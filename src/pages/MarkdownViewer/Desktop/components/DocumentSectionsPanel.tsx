import React from 'react';
import SectionProgressMenu from './SectionProgressMenu';

interface DocumentSectionsPanelProps {
  userId: string;
  conversationId: string;
  isArchiveView: boolean;
}

const DocumentSectionsPanel: React.FC<DocumentSectionsPanelProps> = ({ 
  userId, 
  conversationId, 
  isArchiveView 
}) => {
  return (
    <div className="bg-[#F0F0F0] rounded-lg overflow-hidden w-full border border-[#CCCCCC]">
      <div className="bg-[#F0F0F0] p-3 border-b border-[#CCCCCC]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700 font-quicksand">
            Document Sections
          </span>
        </div>
      </div>
      <div className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
        <SectionProgressMenu 
          userId={userId} 
          conversationId={conversationId}
          isArchiveView={isArchiveView}
          isInPanel={true}
        />
      </div>
    </div>
  );
};

export default DocumentSectionsPanel;