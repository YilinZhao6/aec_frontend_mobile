import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface DiagramRendererProps {
  userId: string;
  conversationId: string;
  isArchiveView: boolean;
}

const DiagramRenderer: React.FC<DiagramRendererProps> = ({ 
  userId, 
  conversationId,
  isArchiveView 
}) => {
  const [diagram, setDiagram] = useState('');
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);
  const renderAttemptRef = useRef(0);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Quicksand',
    });
  }, []);

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const response = await fetch('https://backend-ai-cloud-explains.onrender.com/generate_diagram_and_topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            conversation_id: conversationId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch diagram');
        }

        const data = await response.json();
        if (data.diagram) {
          // Extract Mermaid code from markdown code block
          const mermaidCode = data.diagram.replace(/```mermaid\n|\n```/g, '').trim();
          setDiagram(mermaidCode);
        }
        if (data.related_topics) {
          setRelatedTopics(data.related_topics);
        }
      } catch (error) {
        console.error('Error fetching diagram:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch diagram');
      } finally {
        setLoading(false);
      }
    };

    if (userId && conversationId) {
      fetchDiagram();
    }
  }, [userId, conversationId]);

  // Render diagram when data is available
  useEffect(() => {
    if (!diagram || !diagramContainerRef.current) return;

    const renderDiagram = async () => {
      try {
        const container = diagramContainerRef.current;
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create new diagram div
        const diagramDiv = document.createElement('div');
        diagramDiv.id = diagramId.current;
        diagramDiv.className = 'mermaid';
        diagramDiv.textContent = diagram;
        container.appendChild(diagramDiv);
        
        // Render diagram
        await mermaid.run({
          nodes: [diagramDiv]
        });
        
        // Reset render attempts
        renderAttemptRef.current = 0;
      } catch (error) {
        console.error('Error rendering diagram:', error);
        
        // Retry up to 3 times
        if (renderAttemptRef.current < 3) {
          renderAttemptRef.current += 1;
          setTimeout(renderDiagram, 500);
        } else {
          setError('Failed to render diagram');
        }
      }
    };

    // Small delay to ensure container is ready
    setTimeout(renderDiagram, 100);
  }, [diagram]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
        {error}
      </div>
    );
  }

  if (!diagram && !relatedTopics.length) {
    return null;
  }

  return (
    <div className="mb-6">
      {relatedTopics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((topic, index) => (
              <span 
                key={index}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {diagram && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Concept Map</h3>
            <div 
              ref={diagramContainerRef}
              className="overflow-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramRenderer;