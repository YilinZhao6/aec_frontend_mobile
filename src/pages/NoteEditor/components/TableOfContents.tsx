import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { NOTE_EDITOR_STRINGS } from '../../../constants/strings';

interface Heading {
  id: string;
  level: number;
  text: string;
  position: number;
}

interface TableOfContentsProps {
  editor: any;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ editor }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const newHeadings: Heading[] = [];
      let id = 0;

      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'heading') {
          newHeadings.push({
            id: `heading-${id++}`,
            level: node.attrs.level,
            text: node.textContent,
            position: pos
          });
        }
      });

      setHeadings(newHeadings);
    };

    // Initial update
    updateHeadings();

    // Subscribe to document changes
    editor.on('update', updateHeadings);

    // Subscribe to transaction updates
    editor.on('transaction', updateHeadings);

    return () => {
      editor.off('update', updateHeadings);
      editor.off('transaction', updateHeadings);
    };
  }, [editor]);

  const handleHeadingClick = (position: number) => {
    editor.commands.setTextSelection(position);
    editor.commands.scrollIntoView();
  };

  return (
    <div className="toc-container">
      <div 
        className="toc-header"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        <span>{t(NOTE_EDITOR_STRINGS.TABLE_OF_CONTENTS.TITLE)}</span>
      </div>

      {!collapsed && (
        <div className="toc-content">
          {headings.length === 0 ? (
            <div className="toc-empty">
              {t(NOTE_EDITOR_STRINGS.TABLE_OF_CONTENTS.NO_HEADINGS)}
            </div>
          ) : (
            <div className="toc-list">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  className="toc-item"
                  style={{ paddingLeft: `${heading.level * 12}px` }}
                  onClick={() => handleHeadingClick(heading.position)}
                >
                  {heading.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableOfContents;