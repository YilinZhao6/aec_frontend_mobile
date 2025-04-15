import React from 'react';
import { Clock, Zap, Rocket } from 'lucide-react';

interface ModeSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'fast' | 'normal' | 'pro') => void;
}

const ModeSelectionDialog: React.FC<ModeSelectionDialogProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const modes = [
    {
      id: 'fast',
      name: 'Fast',
      description: 'Quick, concise explanations',
      icon: Clock,
      color: 'bg-[#fff7c2] border-[#ffd700] hover:bg-[#fff3a3] text-[#856404]'
    },
    {
      id: 'normal',
      name: 'Normal',
      description: 'Detailed explanations with examples',
      icon: Zap,
      color: 'bg-[#dbeafe] border-[#93c5fd] hover:bg-[#bfdbfe] text-[#1e40af]'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'In-depth analysis with advanced concepts',
      icon: Rocket,
      color: 'bg-[#e2c0ff] border-[#a78bfa] hover:bg-[#ddd6fe] text-[#5b21b6]'
    }
  ] as const;

  return (
    <>
      <div className="modal-overlay" />
      <div className="dialog-container">
        <div className="dialog-content">
          <h2 className="text-xl font-semibold mb-2 font-quicksand">Choose Explanation Mode</h2>
          <p className="text-gray-600 mb-6 text-sm font-quicksand">
            Select how you want the concept to be explained
          </p>
          
          <div className="space-y-3">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    onSelect(mode.id);
                    onClose();
                  }}
                  className={`w-full p-4 rounded-lg border transition-colors duration-200 ${mode.color} flex items-start gap-4`}
                >
                  <Icon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium font-quicksand">{mode.name}</div>
                    <div className="text-sm opacity-90 font-quicksand">{mode.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800 transition-colors font-quicksand text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default ModeSelectionDialog;