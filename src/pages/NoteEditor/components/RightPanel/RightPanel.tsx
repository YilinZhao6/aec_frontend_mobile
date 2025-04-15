import React from 'react';
import { ChevronsRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import ProExplanationRenderer from '../ProExplanationRenderer';

interface RightPanelProps {
  concept: {
    concept: string;
    explanation: string;
    tag: string;
    mode?: 'fast' | 'normal' | 'pro';
  } | null;
  onClose: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ concept, onClose }) => {
  if (!concept) return null;

  const getBadgeStyles = (mode: string = 'normal') => {
    switch (mode) {
      case 'fast':
        return 'bg-[#fff7c2] text-[#856404]';
      case 'pro':
        return 'bg-[#e2c0ff] text-[#5b21b6]';
      default:
        return 'bg-[#dbeafe] text-[#1e40af]';
    }
  };

  const getModeLabel = (mode: string = 'normal') => {
    const labels = {
      fast: 'Fast',
      normal: 'Normal',
      pro: 'Pro'
    };
    return `${labels[mode as keyof typeof labels]} Explanation`;
  };

  return (
    <div className="fixed top-[6.5rem] right-0 w-[35%] h-[calc(100vh-6.5rem)] bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="font-quicksand font-semibold text-gray-800 text-lg">
              {concept.concept}
            </h2>
            <span className={`
              px-2.5 py-1 rounded-full text-xs font-medium font-quicksand
              ${getBadgeStyles(concept.mode)}
            `}>
              {getModeLabel(concept.mode)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse"
          >
            <ChevronsRight size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <ProExplanationRenderer content={concept.explanation} />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;