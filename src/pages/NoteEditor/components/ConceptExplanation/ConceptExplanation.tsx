import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ConceptExplanationProps {
  concept: {
    concept: string;
    explanation: string;
    tag: string;
    mode?: 'normal' | 'pro';
  };
}

const ConceptExplanation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { concept } = location.state as ConceptExplanationProps;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="h-16 flex items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100 rounded-full p-2 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h1 className="ml-4 text-xl font-semibold text-gray-800 font-quicksand">
            {concept.concept}
          </h1>

          <div className="ml-4">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${concept.mode === 'pro' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
            `}>
              {concept.mode === 'pro' ? 'Pro' : 'Normal'} Explanation
            </span>
          </div>
        </div>
      </div>

      <div className="pt-24 px-4 pb-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className="prose max-w-none"
          >
            {concept.explanation}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ConceptExplanation;