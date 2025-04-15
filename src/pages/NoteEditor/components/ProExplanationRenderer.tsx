import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface ProExplanationRendererProps {
  content: string;
}

const ProExplanationRenderer: React.FC<ProExplanationRendererProps> = ({ content }) => {
  // Custom components for rendering different markdown elements
  const components = {
    // Handle different heading levels
    h1: ({ node, ...props }: any) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200 font-quicksand" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8 font-quicksand" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-xl font-medium text-gray-700 mb-3 mt-6 font-quicksand" {...props} />
    ),
    h4: ({ node, ...props }: any) => (
      <h4 className="text-lg font-medium text-gray-600 mb-2 mt-4 font-quicksand" {...props} />
    ),
    h5: ({ node, ...props }: any) => (
      <h5 className="text-base font-medium text-gray-600 mb-2 mt-4 font-quicksand" {...props} />
    ),
    h6: ({ node, ...props }: any) => (
      <h6 className="text-sm font-medium text-gray-600 mb-2 mt-4 font-quicksand" {...props} />
    ),

    // Handle paragraphs
    p: ({ node, ...props }: any) => (
      <p className="text-base text-gray-700 mb-4 leading-relaxed font-quicksand" {...props} />
    ),

    // Handle lists
    ul: ({ node, ...props }: any) => (
      <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 font-quicksand" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 font-quicksand" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="text-base text-gray-700 leading-relaxed font-quicksand" {...props} />
    ),

    // Handle figures with custom styling
    figure: ({ node, ...props }: any) => {
      const style = node.properties?.style || '';
      return (
        <figure 
          style={{ ...parseStyles(style) }}
          className="bg-gray-50 rounded-lg overflow-hidden shadow-sm"
          {...props}
        />
      );
    },

    // Handle images with custom styling
    img: ({ node, ...props }: any) => {
      const style = node.properties?.style || '';
      return (
        <img 
          style={{ ...parseStyles(style) }}
          className="max-w-full h-auto rounded-lg"
          {...props}
          alt={props.alt || ''}
        />
      );
    },

    // Handle figcaption with custom styling
    figcaption: ({ node, ...props }: any) => {
      const style = node.properties?.style || '';
      return (
        <figcaption 
          style={{ ...parseStyles(style) }}
          className="text-sm text-gray-600 italic p-3 border-t border-gray-200"
          {...props}
        />
      );
    },

    // Handle blockquotes
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 text-gray-700 italic font-quicksand" {...props} />
    ),

    // Handle code blocks
    code: ({ node, inline, ...props }: any) => (
      inline ? (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800 font-mono" {...props} />
      ) : (
        <code className="block bg-gray-100 p-4 rounded-lg text-sm text-gray-800 font-mono overflow-x-auto my-4" {...props} />
      )
    ),

    // Handle links with custom styling
    a: ({ node, ...props }: any) => {
      const style = node.properties?.style || '';
      return (
        <a
          style={{ ...parseStyles(style) }}
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    },

    // Handle emphasis (italics)
    em: ({ node, ...props }: any) => (
      <em className="italic text-gray-700" {...props} />
    ),

    // Handle strong (bold)
    strong: ({ node, ...props }: any) => (
      <strong className="font-semibold text-gray-900" {...props} />
    ),

    // Handle highlighted text
    highlight: ({ node, children }: any) => (
      <span className="bg-yellow-100 px-1 rounded text-gray-900">{children}</span>
    ),

    // Handle custom example boxes
    div: ({ node, ...props }: any) => {
      if (node.properties?.className?.includes('example-box')) {
        return (
          <div className="my-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-semibold text-blue-900 mb-4 font-quicksand">Example</h4>
            <div className="text-blue-800">{props.children}</div>
          </div>
        );
      }
      return <div {...props} />;
    },

    // Handle citations
    cite: ({ node, children }: any) => {
      const source = node.properties?.source;
      const url = node.properties?.url;
      return (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Source:</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {source}
            </a>
          </div>
        </div>
      );
    },

    // Handle question areas
    'question-area': ({ node, children }: any) => (
      <div className="my-8 p-6 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-4 font-quicksand">Practice Questions</h4>
        <div className="space-y-6">{children}</div>
      </div>
    ),

    // Handle individual questions
    question: ({ node, children }: any) => (
      <div className="flex items-start gap-3">
        <span className="font-semibold text-blue-900 text-lg">Q:</span>
        <span className="text-blue-900 flex-1">{children}</span>
      </div>
    ),

    // Handle answers
    answer: ({ node, children }: any) => {
      if (!children || children.length === 0) return null;
      return (
        <div className="flex items-start gap-3 pl-8 mt-2">
          <span className="font-semibold text-green-800 text-lg">A:</span>
          <span className="text-green-800 flex-1">{children}</span>
        </div>
      );
    },

    // Handle tables
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border border-gray-200 rounded-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-gray-50 border-b border-gray-200" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 font-quicksand" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200 font-quicksand" {...props} />
    )
  };

  // Helper function to parse inline styles
  const parseStyles = (styleString: string): Record<string, string> => {
    if (!styleString) return {};
    
    return styleString
      .split(';')
      .filter(Boolean)
      .reduce((acc, style) => {
        const [property, value] = style.split(':').map(s => s.trim());
        if (property && value) {
          const camelProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase());
          acc[camelProperty] = value;
        }
        return acc;
      }, {} as Record<string, string>);
  };

  // Process custom tags before rendering
  const processContent = (content: string): string => {
    // Convert <CITE> tags
    content = content.replace(
      /<CITE:\s*([^,]+),\s*([^>]+)>/g,
      (_, source, url) => `<cite source="${source.trim()}" url="${url.trim()}"></cite>`
    );

    // Convert <highlight> tags
    content = content.replace(
      /<highlight>(.*?)<\/highlight>/g,
      (_, text) => `<highlight>${text}</highlight>`
    );

    // Convert question areas
    content = content.replace(
      /<question_area>([\s\S]*?)<\/question_area>/g,
      (_, content) => `<question-area>${content}</question-area>`
    );

    return content;
  };

  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
};

export default ProExplanationRenderer;