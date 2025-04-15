import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Concept {
  concept: string;
  explanation: string;
  tag: string;
  mode?: 'fast' | 'normal' | 'pro';
  text?: string;
}

interface ConceptExplanationsProps {
  concepts: Concept[];
  editorRef: React.RefObject<HTMLDivElement>;
  onConceptClick?: (concept: Concept) => void;
}

const ConceptExplanations: React.FC<ConceptExplanationsProps> = ({ 
  concepts, 
  editorRef,
  onConceptClick 
}) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [conceptPositions, setConceptPositions] = useState<Map<string, { top: number; height: number; originalTop: number }>>(new Map());
  const [adjustedPositions, setAdjustedPositions] = useState<Map<string, { top: number; height: number; originalTop: number; adjustedTop: number; cardHeight: number }>>(new Map());
  const explanationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateAdjustedPositions = () => {
      const newAdjustedPositions = new Map();
      const sortedConcepts = [...conceptPositions.entries()].sort((a, b) => a[1].top - b[1].top);
      
      let lastBottom = -Infinity;
      const minPadding = 16;
      const expandedPadding = 32;
      const collapsedHeight = 84;
      const expandedHeight = 220;

      sortedConcepts.forEach(([tag, position], index) => {
        const isExpanded = expandedComments.has(tag);
        const cardHeight = isExpanded ? expandedHeight : collapsedHeight;
        const desiredTop = position.top;
        
        const previousTag = index > 0 ? sortedConcepts[index - 1][0] : null;
        const previousWasExpanded = previousTag && expandedComments.has(previousTag);
        const requiredPadding = previousWasExpanded ? expandedPadding : minPadding;
        
        const adjustedTop = Math.max(desiredTop, lastBottom + requiredPadding);
        
        newAdjustedPositions.set(tag, {
          ...position,
          adjustedTop: adjustedTop,
          cardHeight: cardHeight,
          originalTop: position.top
        });
        
        lastBottom = adjustedTop + cardHeight;
      });

      setAdjustedPositions(newAdjustedPositions);
    };

    calculateAdjustedPositions();
  }, [conceptPositions, expandedComments]);

  useEffect(() => {
    if (!editorRef.current) return;

    const updateConceptPositions = () => {
      const newPositions = new Map();
      
      document.querySelectorAll('.concept-mark').forEach(element => {
        const tag = element.getAttribute('data-concept-tag');
        if (tag) {
          const bounds = element.getBoundingClientRect();
          const mode = element.getAttribute('data-concept-mode') || 'normal';
          
          // Update the concepts array with the correct mode
          const conceptIndex = concepts.findIndex(c => c.tag === tag);
          if (conceptIndex !== -1) {
            concepts[conceptIndex].mode = mode as 'fast' | 'normal' | 'pro';
          }
          
          newPositions.set(tag, {
            top: bounds.top + window.scrollY,
            height: bounds.height,
            originalTop: bounds.top + window.scrollY
          });
        }
      });

      setConceptPositions(newPositions);
    };

    const handleScroll = () => {
      requestAnimationFrame(updateConceptPositions);
    };

    const observer = new MutationObserver(updateConceptPositions);
    observer.observe(editorRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-concept-mode']
    });

    window.addEventListener('resize', updateConceptPositions);
    window.addEventListener('scroll', handleScroll);
    
    updateConceptPositions();

    const handleConceptClick = (e: MouseEvent) => {
      const conceptMark = (e.target as HTMLElement).closest('.concept-mark');
      if (conceptMark) {
        const tag = conceptMark.getAttribute('data-concept-tag');
        const mode = conceptMark.getAttribute('data-concept-mode') || 'normal';
        
        if (tag) {
          const concept = concepts.find(c => c.tag === tag);
          if (!concept) return;

          // Update the concept's mode
          concept.mode = mode as 'fast' | 'normal' | 'pro';

          setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
              newSet.delete(tag);
            } else {
              newSet.add(tag);
            }
            return newSet;
          });

          if (onConceptClick) {
            onConceptClick(concept);
          }
        }
      }
    };

    const handleDocumentClick = (e: MouseEvent) => {
      if (!explanationsRef.current?.contains(e.target as Node) && 
          !(e.target as HTMLElement).closest('.concept-mark')) {
        setExpandedComments(new Set());
      }
    };

    editorRef.current.addEventListener('click', handleConceptClick);
    document.addEventListener('click', handleDocumentClick);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateConceptPositions);
      window.removeEventListener('scroll', handleScroll);
      editorRef.current?.removeEventListener('click', handleConceptClick);
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [editorRef, concepts, onConceptClick]);

  const explanationWidth = Math.min(Math.max(window.innerWidth * 0.25, 300), 400);

  const getBadgeStyles = (mode: string = 'normal') => {
    switch (mode) {
      case 'fast':
        return 'border-[#ffd700] bg-[#fff7c2]';
      case 'pro':
        return 'border-[#a78bfa] bg-[#e2c0ff]';
      default:
        return 'border-[#93c5fd] bg-[#dbeafe]';
    }
  };

  return (
    <div 
      ref={explanationsRef}
      className="absolute top-0 right-0"
      style={{
        width: `${explanationWidth}px`,
        transform: `translateX(calc(100% + 1rem))`,
        maxWidth: 'calc(100vw - 100%)'
      }}
    >
      {[...conceptPositions.keys()].sort((a, b) => {
        const posA = adjustedPositions.get(a)?.adjustedTop || 0;
        const posB = adjustedPositions.get(b)?.adjustedTop || 0;
        return posA - posB;
      }).map(tag => {
        const concept = concepts.find(c => c.tag === tag);
        const position = conceptPositions.get(tag);
        const adjustedPosition = adjustedPositions.get(tag);
        
        if (!position || !adjustedPosition || !concept) return null;

        const isExpanded = expandedComments.has(tag);
        const verticalOffset = 100;

        return (
          <div
            key={tag}
            className={`
              bg-white rounded-lg shadow-sm border overflow-hidden 
              transition-all duration-300 ease-in-out cursor-pointer
              ${isExpanded ? 'shadow-md' : ''}
              ${getBadgeStyles(concept.mode)}
            `}
            style={{
              position: 'absolute',
              top: adjustedPosition.adjustedTop,
              width: '100%',
              transform: `translateY(-${verticalOffset}px)`,
              zIndex: isExpanded ? 2 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpandedComments(prev => {
                const newSet = new Set(prev);
                if (newSet.has(tag)) {
                  newSet.delete(tag);
                } else {
                  newSet.add(tag);
                }
                return newSet;
              });
              if (onConceptClick) {
                onConceptClick(concept);
              }
            }}
          >
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">
                {concept.concept}
              </div>
              <div 
                className={`
                  text-sm text-gray-600 overflow-hidden transition-all duration-300 ease-in-out
                  ${isExpanded ? 'max-h-96' : 'max-h-6 line-clamp-1'}
                `}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {concept.explanation}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConceptExplanations;