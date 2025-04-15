import React from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface QuestionWithAnswerProps {
  question: string;
  answer?: string;
  userId: string;
  conversationId: string;
}

const QuestionWithAnswer: React.FC<QuestionWithAnswerProps> = ({ 
  question, 
  answer: initialAnswer, 
  userId, 
  conversationId 
}) => {
  const [isAnswerVisible, setIsAnswerVisible] = React.useState(false);
  const [answer, setAnswer] = React.useState(initialAnswer);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchAnswer = async () => {
    if (answer || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/ask_in_section_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId,
          question: question
        }),
      });

      const data = await response.json();
      if (data.explanation) {
        setAnswer(data.explanation);
        setIsAnswerVisible(true);
      }
    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!answer) {
      fetchAnswer();
    } else {
      setIsAnswerVisible(!isAnswerVisible);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={handleClick}
        className="w-full text-left px-6 py-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 text-black font-quicksand flex items-center"
      >
        <div className="flex items-center justify-between w-full">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className="font-quicksand text-black font-medium py-1 flex-1 flex items-center"
          >
            {question}
          </ReactMarkdown>
          {!answer && !isLoading && <HelpCircle className="w-5 h-5 text-gray-500 flex-shrink-0 my-auto" />}
          {isLoading && <Loader2 className="w-5 h-5 text-gray-500 animate-spin flex-shrink-0 my-auto" />}
        </div>
      </button>
      
      {isLoading && (
        <div className="mt-2 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-sweep" />
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-sweep" />
            </div>
          </div>
        </div>
      )}
      
      {answer && isAnswerVisible && (
        <div className="mt-2 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200 text-black font-quicksand">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            className="font-quicksand font-medium"
          >
            {answer}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export const processCustomTags = (content: string, userId: string, conversationId: string) => {
  if (!content) return { processedContent: '', qaComponents: [] };
  
  let processedContent = content;
  const qaComponents: { id: string; component: React.ReactNode }[] = [];

  processedContent = processedContent.replace(
    /<CITE:\s*([^,]+),\s*([^>]+)>/g, 
    (match: string, source: string, url: string) => {
      const id = 'citation-' + Math.random().toString(36).substring(2, 12);
      return `<a id="${id}" href="${url.trim()}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-2 py-1 my-2 bg-gray-50 hover:bg-gray-100 text-gray-900 text-xs rounded-md border-2 border-gray-300 transition-colors ml-1 font-quicksand">
        <span>${source.trim()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>`;
    }
  );


  // Process highlights
  processedContent = processedContent.replace(
    /<highlight>(.*?)<\/highlight>/g,
    '<span class="font-bold bg-yellow-200 px-1 rounded font-quicksand">$1</span>'
  );

  // Process questions within question_area tags
  processedContent = processedContent.replace(
    /<question_area>([\s\S]*?)<\/question_area>/g,
    (match: string, content: string) => {
      return content.replace(
        /<question>([\s\S]*?)<\/question>\s*(?:<answer>([\s\S]*?)<\/answer>)?/g,
        (match: string, question: string, answer: string = '') => {
          const componentId = `qa-${Math.random().toString(36).substring(2, 12)}`;
          qaComponents.push({
            id: componentId,
            component: (
              <QuestionWithAnswer 
                key={componentId} 
                question={question.trim()} 
                answer={answer.trim()}
                userId={userId}
                conversationId={conversationId}
              />
            )
          });
          return `<div id="${componentId}"></div>`;
        }
      );
    }
  );

  return { processedContent, qaComponents };
};

export const customComponents = (qaComponents: { id: string; component: React.ReactNode }[]) => ({
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-semibold mb-6 font-quicksand">{children}</h1>
  ),
  
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold mb-4 font-quicksand">{children}</h2>
  ),

  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold mb-3 font-quicksand">{children}</h3>
  ),

  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-base mb-4 font-quicksand">{children}</p>
  ),

  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 font-quicksand">{children}</ul>
  ),

  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 font-quicksand">{children}</ol>
  ),

  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-base font-quicksand">{children}</li>
  ),

  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 text-gray-700 italic font-quicksand">{children}</blockquote>
  ),

  code: ({ node, inline, ...props }: any) => (
    inline ? (
      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800 font-mono" {...props} />
    ) : (
      <code className="block bg-gray-100 p-4 rounded-lg text-sm text-gray-800 font-mono overflow-x-auto my-4" {...props} />
    )
  ),

  a: ({ node, ...props }: any) => (
    <a className="text-blue-600 hover:underline font-quicksand" {...props} />
  ),

  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-700 font-quicksand">{children}</em>
  ),

  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900 font-quicksand">{children}</strong>
  ),
  
  div: ({ node, ...props }: any) => {
    if (props.id && props.id.startsWith('qa-')) {
      const qaComponent = qaComponents.find(qa => qa.id === props.id);
      return qaComponent ? qaComponent.component : null;
    }
    return <div className="font-quicksand" {...props} />;
  }
});