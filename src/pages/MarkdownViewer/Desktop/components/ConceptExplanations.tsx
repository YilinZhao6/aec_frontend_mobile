import React, { useState, useEffect, useRef } from 'react';

interface Concept {
  tag: string;
  text: string;
  explanation: string;
}

interface ConceptExplanationsProps {
  concepts: Concept[];
  editorRef: React.RefObject<HTMLElement>;
}

const ConceptExplanations: React.FC<ConceptExplanationsProps> = ({ concepts, editorRef }) => {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [conceptPositions, setConceptPositions] = useState<Map<string, { top: number, height: number, originalTop: number }>>(new Map());
  const [adjustedPositions, setAdjustedPositions] = useState<Map<string, { adjustedTop: number, cardHeight: number, originalTop: number, top: number, height: number }>>(new Map());
  const explanationsRef = useRef<HTMLDivElement>(null);

  // Calculate adjusted positions to prevent overlapping
  useEffect(() => {
    const calculateAdjustedPositions = () => {
      const newAdjustedPositions = new Map();
      const sortedConcepts = [...conceptPositions.entries()].sort((a, b) => a[1].top - b[1].top);
      
      let lastBottom = -Infinity;
      const minPadding = 16; // Minimum space between cards
      const expandedPadding = 32; // Larger padding after expanded cards
      const collapsedHeight = 84; // Approximate height of collapsed card
      const expandedHeight = 220; // Increased height for expanded card

      sortedConcepts.forEach(([tag, position], index) => {
        const isExpanded = expandedComments.has(tag);
        const cardHeight = isExpanded ? expandedHeight : collapsedHeight;
        const desiredTop = position.top;
        
        // Calculate required padding based on previous card's state
        const previousTag = index > 0 ? sortedConcepts[index - 1][0] : null;
        const previousWasExpanded = previousTag && expandedComments.has(previousTag);
        const requiredPadding = previousWasExpanded ? expandedPadding : minPadding;
        
        // If this card would overlap with the previous one, adjust its position
        const adjustedTop = Math.max(desiredTop, lastBottom + requiredPadding);
        
        // Store both the original and adjusted positions
        newAdjustedPositions.set(tag, {
          ...position,
          adjustedTop: adjustedTop,
          cardHeight: cardHeight,
          originalTop: position.top
        });
        
        // Update lastBottom for next iteration
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
          newPositions.set(tag, {
            top: bounds.top + window.scrollY,
            height: bounds.height,
            originalTop: bounds.top + window.scrollY
          });
        }
      });

      setConceptPositions(newPositions);
    };

    // Update positions on scroll
    const handleScroll = () => {
      requestAnimationFrame(updateConceptPositions);
    };

    // Update positions on content changes
    const observer = new MutationObserver(updateConceptPositions);
    observer.observe(editorRef.current, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Update positions on window resize
    window.addEventListener('resize', updateConceptPositions);
    window.addEventListener('scroll', handleScroll);
    
    // Initial position update
    updateConceptPositions();

    // Add click handler for concept marks
    const handleConceptClick = (e: MouseEvent) => {
      const conceptMark = (e.target as Element).closest('.concept-mark');
      if (conceptMark) {
        const tag = conceptMark.getAttribute('data-concept-tag');
        if (tag) {
          setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tag)) {
              newSet.delete(tag);
            } else {
              newSet.add(tag);
            }
            return newSet;
          });
        }
      }
    };

    // Add click handler for document to auto-collapse
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!explanationsRef.current?.contains(target) && 
          !target.closest('.concept-mark')) {
        setExpandedComments(new Set());
      }
    };

    editorRef.current.addEventListener('click', handleConceptClick as EventListener);
    document.addEventListener('click', handleDocumentClick as EventListener);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateConceptPositions);
      window.removeEventListener('scroll', handleScroll);
      editorRef.current?.removeEventListener('click', handleConceptClick as EventListener);
      document.removeEventListener('click', handleDocumentClick as EventListener);
    };
  }, [editorRef]);

  // Calculate the width based on viewport width
  const explanationWidth = Math.min(Math.max(window.innerWidth * 0.25, 300), 400);

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
              bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden 
              transition-all duration-300 ease-in-out cursor-pointer
              ${isExpanded ? 'shadow-md' : ''}
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
            }}
          >
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 mb-2">
                {concept.text}
              </div>
              <div 
                className={`
                  text-sm text-gray-600 overflow-hidden transition-all duration-300 ease-in-out
                  ${isExpanded ? 'max-h-96' : 'max-h-6 line-clamp-1'}
                `}
              >
                {concept.explanation}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConceptExplanations; 