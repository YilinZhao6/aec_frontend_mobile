import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Printer,
  Share2,
  ArrowLeft,
  LayoutList
} from 'lucide-react';

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrint: () => void;
  onSavePDF: () => void;
  onBack: () => void;
  onToggleSections: () => void;
  showSections: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  zoom,
  onZoomIn,
  onZoomOut,
  onPrint,
  onSavePDF,
  onBack,
  onToggleSections,
  showSections
}) => {
  return (
    <div className="bg-gray-200 border-b border-[#CCCCCC] transition-colors duration-300 w-full">
      <div className="flex items-center justify-between h-11 px-4">
        {/* Left Tools Group */}
        <div className="flex items-center space-x-1">
          <ToolbarButton icon={ArrowLeft} label="Back" onClick={onBack} />
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <ToolbarButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
          <div className="px-2 text-sm text-gray-900 font-quicksand">{zoom}%</div>
          <ToolbarButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
          <div className="mx-2 h-4 w-px bg-gray-300" />
          <ToolbarButton 
            icon={LayoutList} 
            label="Sections" 
            onClick={onToggleSections}
            isActive={showSections}
          />
        </div>

        {/* Right Tools Group */}
        <div className="flex items-center space-x-1">
          <ToolbarButton icon={Share2} label="Share" onClick={() => {}} />
          <ToolbarButton icon={Printer} label="Print" onClick={onPrint} />
          <ToolbarButton icon={Download} label="PDF" onClick={onSavePDF} />
        </div>
      </div>
    </div>
  );
};

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon: Icon, label, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}
    title={label}
  >
    <Icon className="w-4 h-4" />
  </button>
);