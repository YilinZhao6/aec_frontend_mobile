import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React from 'react';
import katex from 'katex';

interface LatexComponentProps {
  node: {
    attrs: {
      formula: string;
    };
  };
  updateAttributes: (attrs: { formula: string }) => void;
}

const LatexComponent: React.FC<LatexComponentProps> = ({ node }) => {
  // Ensure formula is a string and has a default value
  const formula = String(node.attrs.formula || '');
  
  // Only render if we have a valid formula
  if (!formula.trim()) {
    return (
      <NodeViewWrapper className="latex-inline">
        <span className="latex-formula-empty">Empty formula</span>
      </NodeViewWrapper>
    );
  }

  try {
    return (
      <NodeViewWrapper className="latex-inline">
        <span 
          data-type="latex"
          className="latex-formula"
          contentEditable={false}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(formula, {
              throwOnError: false,
              displayMode: false,
              strict: false,
              output: 'html'
            })
          }}
        />
      </NodeViewWrapper>
    );
  } catch (error) {
    console.error('LaTeX rendering error:', error);
    return (
      <NodeViewWrapper className="latex-inline">
        <span className="latex-formula-error">Invalid LaTeX formula</span>
      </NodeViewWrapper>
    );
  }
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    latex: {
      setLatex: (attrs: { formula: string }) => ReturnType;
    };
  }
}

export const LatexExtension = Node.create({
  name: 'latex',
  
  group: 'inline', // Changed from 'block' to 'inline'
  inline: true,    // Added to make it inline
  atom: true,
  draggable: true,
  selectable: true,
  
  addAttributes() {
    return {
      formula: {
        default: '',
        parseHTML: element => element.textContent?.trim() || '',
        renderHTML: attributes => attributes.formula || ''
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="latex"]',
        getAttrs: node => ({
          formula: (node as HTMLElement).textContent?.trim() || ''
        })
      }
    ];
  },

  renderHTML({ node }) {
    return [
      'span',
      { 
        'data-type': 'latex',
        'class': 'latex-formula'
      },
      node.attrs.formula || ''
    ];
  },

  addCommands() {
    return {
      setLatex: attrs => ({ commands, chain }) => {
        return commands.insertContent({
          type: this.name,
          attrs
        });
      }
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexComponent);
  }
});