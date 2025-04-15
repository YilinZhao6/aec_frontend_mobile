import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Loader2, ZoomIn, ZoomOut, Move } from 'lucide-react';
import mermaid from 'mermaid';
import { customComponents } from './utils/markdownUtils';
import ConceptExplanations from './components/ConceptExplanations';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

interface MarkdownContentProps {
  content: string;
  isLoading: boolean;
  qaComponents: { id: string; component: React.ReactNode }[];
  zoom: number;
  userId: string;
  conversationId: string;
  isComplete: boolean;
  diagramData: { diagram: string; related_topics: string[] } | null;
  isDiagramLoading: boolean;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isLoading,
  qaComponents,
  zoom,
  userId,
  conversationId,
  isComplete,
  diagramData,
  isDiagramLoading
}) => {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramRenderedRef = useRef(false);
  const [diagramZoom, setDiagramZoom] = useState(100);
  const diagramZoomRef = useRef(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [conceptTopics, setConceptTopics] = useState<{tag: string; text: string; explanation: string}[]>([]);

  const extractConceptsFromContent = (content: string) => {
    const conceptRegex = /<span\s+data-concept-tag="([^"]+)"[^>]*>([^<]+)<\/span>/g;
    const boldTermsRegex = /\*\*([^*]+)\*\*/g;
    const simpleVarRegex = /\$([a-zA-Z][a-zA-Z0-9_]{0,2})\$/g;

    const excludedTerms = [
      'problem', 'solution', 'example', '第一部分', '第二部分', '第三部分',
      '一', '二', '三', '四', '五', '引言', '结论', 'introduction', 'conclusion',
      'summary', '摘要', '概述', '总结', 'exercise', '练习', 'question', '问题',
      'answer', 'part', 'section'
    ];

    const concepts: {tag: string; text: string; explanation: string}[] = [];
    const processedTags = new Set<string>();
    const maxConcepts = 30;

    const removePrefixes = (text: string) => {
      return text.replace(/^(example|例子|例题|练习|问题|solution|解答|解决方案|问题)\s*[:：]\s*/i, '').trim();
    };

    const shouldExcludeTerm = (text: string) => {
      const lowerText = text.toLowerCase();
      
      if (excludedTerms.some(term => lowerText === term || lowerText.startsWith(term + ':'))) {
        return true;
      }
      
      if (text.length < 3) {
        return true;
      }
      
      return false;
    };

    let match;
    while ((match = conceptRegex.exec(content)) !== null) {
      const tag = match[1];
      let text = match[2].trim();
      
      text = removePrefixes(text);
      
      if (shouldExcludeTerm(text)) continue;
      
      if (!processedTags.has(tag) && concepts.length < maxConcepts) {
        concepts.push({
          tag,
          text,
          explanation: `${text}是本文中的一个重要概念。`
        });
        processedTags.add(tag);
      }
    }

    while ((match = boldTermsRegex.exec(content)) !== null) {
      let text = match[1].trim();
      
      text = removePrefixes(text);
      
      if (text.length > 40 || shouldExcludeTerm(text)) continue;
      
      const tag = text.toLowerCase().replace(/\s+/g, '_');
      
      if (!processedTags.has(tag) && concepts.length < maxConcepts) {
        concepts.push({
          tag,
          text,
          explanation: `${text}是本文中的一个重要术语。`
        });
        processedTags.add(tag);
      }
    }

    if (concepts.length >= 5) {
    } else {
      while ((match = simpleVarRegex.exec(content)) !== null && concepts.length < maxConcepts) {
        const text = match[1];
        const tag = `math_${text}`;
        
        if (!processedTags.has(tag)) {
          concepts.push({
            tag,
            text: `$${text}$`,
            explanation: `变量 ${text} 是本文中出现的数学符号。`
          });
          processedTags.add(tag);
        }
      }
    }

    if (concepts.length < 5 && diagramData?.related_topics) {
      diagramData.related_topics.forEach((topic, index) => {
        let cleanTopic = removePrefixes(topic);
        if (shouldExcludeTerm(cleanTopic)) return;
        
        if (concepts.length < maxConcepts) {
          const tag = `topic_${index}`;
          if (!concepts.some(c => c.text.toLowerCase() === cleanTopic.toLowerCase())) {
            concepts.push({
              tag,
              text: cleanTopic,
              explanation: `${cleanTopic}是与本内容相关的主题。`
            });
          }
        }
      });
    }

    return concepts.slice(0, maxConcepts);
  };

  useEffect(() => {
    if (content) {
      const extractedConcepts = extractConceptsFromContent(content);
      setConceptTopics(extractedConcepts);
    }
  }, [content, diagramData?.related_topics]);

  useEffect(() => {
    if (!diagramData?.diagram || !diagramRef.current || diagramRenderedRef.current) return;

    const renderDiagram = async () => {
      try {
        diagramRef.current!.innerHTML = '';
        diagramRenderedRef.current = false;

        const diagramId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        
        const cleanDiagram = diagramData.diagram
          .replace(/^\s+|\s+$/g, '')
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/^[\n\r]+|[\n\r]+$/g, '')
          .trim();

        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Quicksand',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            rankSpacing: 50,
            nodeSpacing: 50,
            padding: 15
          },
          themeVariables: {
            fontSize: '16px',
            fontFamily: 'Quicksand',
            primaryColor: '#e5e7eb',
            primaryBorderColor: '#d1d5db',
            primaryTextColor: '#374151',
            lineColor: '#4b5563',
            secondaryColor: '#e5e7eb',
            tertiaryColor: '#e5e7eb'
          },
          themeCSS: `
            .edgeLabel { background-color: transparent; }
            .node rect { 
              fill: #e5e7eb !important;
              stroke: #d1d5db !important;
              stroke-width: 1px !important;
            }
            .node .label { 
              font-family: Quicksand !important;
              color: #374151 !important;
            }
            .edgeLabel { 
              font-family: Quicksand !important;
              color: #4b5563 !important;
            }
            g[id*="-link-"] { display: none !important; }
            .marker { display: none !important; }
            .flowchart-link { 
              stroke: #4b5563 !important;
              stroke-width: 1.5px !important;
            }
            .node .label foreignObject { overflow: visible; }
            .node foreignObject { overflow: visible; }
            .node .label div { 
              text-align: center;
              color: #374151 !important;
            }
          `
        });
        
        const diagramContainer = document.createElement('div');
        diagramContainer.id = diagramId;
        diagramContainer.className = 'mermaid';
        diagramContainer.textContent = cleanDiagram;
        
        diagramRef.current!.appendChild(diagramContainer);

        await mermaid.run({
          nodes: [diagramContainer],
          suppressErrors: true
        });

        diagramRenderedRef.current = true;

        const svg = diagramContainer.querySelector('svg');
        if (svg) {
          svg.querySelectorAll('[id*="-link-"],[id*="-marker-"]').forEach(el => el.remove());
          
          if (!svg.getAttribute('viewBox')) {
            const bbox = svg.getBBox();
            svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
          }
          
          svg.style.width = '100%';
          svg.style.height = 'auto';
          
          svg.classList.add('concept-map-svg');
          
          svg.style.transform = `scale(${diagramZoom / 100}) translate(${position.x}px, ${position.y}px)`;
          svg.style.transformOrigin = 'top left';
          svg.style.cursor = 'grab';
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        diagramRenderedRef.current = false;
      }
    };

    setTimeout(renderDiagram, 100);
  }, [diagramData, diagramZoom, position]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    diagramZoomRef.current = diagramZoom;
  }, [diagramZoom]);

  const handleZoomIn = () => {
    const newZoom = Math.min(diagramZoomRef.current + 10, 200);
    setDiagramZoom(newZoom);
    diagramZoomRef.current = newZoom;
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(diagramZoomRef.current - 10, 50);
    setDiagramZoom(newZoom);
    diagramZoomRef.current = newZoom;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!diagramRef.current) return;
    
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: positionRef.current.x, y: positionRef.current.y });
    
    svg.style.cursor = 'grabbing';
    svg.classList.add('dragging');
    document.body.style.userSelect = 'none';
    document.body.classList.add('dragging-active');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !diagramRef.current) return;
    
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    const newX = dragOffset.x + dx;
    const newY = dragOffset.y + dy;
    
    positionRef.current = { x: newX, y: newY };
    svg.style.transform = `scale(${diagramZoom / 100}) translate(${newX}px, ${newY}px)`;
  };

  const handleMouseUp = () => {
    if (!diagramRef.current || !isDragging) return;
    
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;
    
    setPosition(positionRef.current);
    setIsDragging(false);
    
    svg.style.cursor = 'grab';
    svg.classList.remove('dragging');
    document.body.style.userSelect = '';
    document.body.classList.remove('dragging-active');
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!diagramRef.current) return;

    e.preventDefault();
    
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;
    
    const rect = diagramRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const currentZoom = diagramZoomRef.current;
    
    let newZoom = currentZoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(currentZoom + 5, 200);
    } else {
      newZoom = Math.max(currentZoom - 5, 50);
    }
    
    if (newZoom === currentZoom) return;
    
    const scaleChange = newZoom / currentZoom;
    
    const currentPos = positionRef.current;
    
    const mouseRealX = (mouseX / (currentZoom / 100)) - currentPos.x;
    const mouseRealY = (mouseY / (currentZoom / 100)) - currentPos.y;
    
    const newX = -(mouseRealX * (newZoom / 100) - mouseX);
    const newY = -(mouseRealY * (newZoom / 100) - mouseY);
    
    positionRef.current = { x: newX, y: newY };
    diagramZoomRef.current = newZoom;
    
    svg.style.transform = `scale(${newZoom / 100}) translate(${newX}px, ${newY}px)`;
    
    requestAnimationFrame(() => {
      setPosition({ x: newX, y: newY });
      setDiagramZoom(newZoom);
    });
  };

  const resetPosition = () => {
    const newPosition = { x: 0, y: 0 };
    const newZoom = 100;
    
    setPosition(newPosition);
    setDiagramZoom(newZoom);
    
    positionRef.current = newPosition;
    diagramZoomRef.current = newZoom;
    
    if (diagramRef.current) {
      const svg = diagramRef.current.querySelector('svg');
      if (svg) {
        svg.style.transform = `scale(${newZoom / 100}) translate(0px, 0px)`;
      }
    }
  };

  useEffect(() => {
    if (!diagramRef.current) return;

    const svgElement = diagramRef.current.querySelector('svg');
    if (svgElement) {
      svgElement.style.transform = `scale(${diagramZoom / 100}) translate(${position.x}px, ${position.y}px)`;
      svgElement.style.transformOrigin = 'top left';
    }
  }, [diagramZoom, position]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!diagramRef.current || !diagramData?.diagram) return;
      
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        (activeElement as HTMLElement).hasAttribute('contenteditable')
      )) {
        return;
      }
      
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault();
        handleZoomIn();
      }
      
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        setDiagramZoom(100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [diagramData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div ref={contentRef}>
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[
            rehypeHighlight,
            [rehypeKatex, { strict: false, throwOnError: false, output: 'html' }],
            rehypeRaw
          ]}
          className="markdown-content"
          components={customComponents(qaComponents)}
        />

        {!isComplete && (
          <div className="space-y-4 mt-8">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-sweep" />
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-sweep" />
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-sweep" />
            </div>
          </div>
        )}
      </div>

      <ConceptExplanations concepts={conceptTopics} editorRef={contentRef} />

      {diagramData && (
        <>
          {diagramData.related_topics && diagramData.related_topics.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-quicksand">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {diagramData.related_topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {conceptTopics.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-quicksand">Concept Topics</h3>
              <div className="flex flex-wrap gap-2">
                {conceptTopics
                  .sort((a, b) => {
                    const aIsMath = a.tag.startsWith('math_');
                    const bIsMath = b.tag.startsWith('math_');
                    if (aIsMath && !bIsMath) return 1;
                    if (!aIsMath && bIsMath) return -1;
                    return a.text.localeCompare(b.text);
                  })
                  .map((concept, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                        concept.tag.startsWith('math_')
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={concept.explanation}
                      onClick={() => {
                        const conceptMarks = document.querySelectorAll(`.concept-mark[data-concept-tag="${concept.tag}"]`);
                        if (conceptMarks.length > 0) {
                          conceptMarks[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                          conceptMarks.forEach(mark => {
                            mark.classList.add('highlight-pulse');
                            setTimeout(() => mark.classList.remove('highlight-pulse'), 2000);
                          });
                        }
                      }}
                    >
                      {concept.text}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {diagramData.diagram && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 font-quicksand">Concept Map</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleZoomOut}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    title="Zoom out (Ctrl -)"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    onClick={() => setDiagramZoom(100)}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    title="Reset zoom (Ctrl 0)"
                  >
                    {diagramZoom}%
                  </button>
                  <button 
                    onClick={handleZoomIn}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    title="Zoom in (Ctrl +)"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button 
                    onClick={resetPosition}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                    title="Reset position"
                  >
                    <Move size={18} />
                  </button>
                </div>
              </div>
              <div 
                ref={diagramRef} 
                className="diagram-container"
                style={{ 
                  height: '500px',
                  width: '100%',
                  overflow: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  background: 'white'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
              />
            </div>
          )}
        </>
      )}

      {isDiagramLoading && (
        <div className="mt-8 flex items-center justify-center py-8 bg-white rounded-lg border border-gray-200">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-3" />
          <span className="text-gray-600">Generating concept map...</span>
        </div>
      )}
    </>
  );
};

export default MarkdownContent;