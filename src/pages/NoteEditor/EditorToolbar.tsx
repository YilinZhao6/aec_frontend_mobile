import React from 'react';
import { 
  Undo2, Redo2, Type, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Image as ImageIcon, Link2, Quote, Code, Table, HelpCircle, Highlighter
} from 'lucide-react';
import ColorPicker from './components/ColorPicker';
import ImageButton from './components/ImageButton';
import LatexButton from './components/LatexButton';
import LinkDialog from './components/LinkDialog';
import TableDialog from './components/TableDialog';

interface EditorToolbarProps {
  editor: any;
  onGenerateExplanation: () => void;
  isGenerating: boolean;
}

const TEXT_COLORS = [
  { name: 'Default', color: 'inherit' },
  { name: 'Gray', color: '#6B7280' },
  { name: 'Red', color: '#EF4444' },
  { name: 'Yellow', color: '#F59E0B' },
  { name: 'Green', color: '#10B981' },
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Pink', color: '#EC4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', color: 'transparent', isNone: true },
  { name: 'Yellow', color: '#FEF9C3' },
  { name: 'Green', color: '#DCFCE7' },
  { name: 'Blue', color: '#DBEAFE' },
  { name: 'Purple', color: '#F3E8FF' },
  { name: 'Pink', color: '#FCE7F3' },
  { name: 'Gray', color: '#F3F4F6' },
];

const EditorToolbar: React.FC<EditorToolbarProps> = ({ 
  editor, 
  onGenerateExplanation,
  isGenerating 
}) => {
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [showTableDialog, setShowTableDialog] = React.useState(false);

  if (!editor) return null;

  const addToolbarDivider = () => (
    <div className="toolbar-divider" />
  );

  return (
    <div className="yuque-toolbar">
      {/* History Controls */}
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`toolbar-button ${!editor.can().undo() ? 'opacity-50' : ''}`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`toolbar-button ${!editor.can().redo() ? 'opacity-50' : ''}`}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={16} />
      </button>

      {addToolbarDivider()}

      {/* Text Style */}
      <select
        onChange={e => {
          const value = e.target.value;
          if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
          }
        }}
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : 'paragraph'
        }
        className="toolbar-select"
      >
        <option value="paragraph">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      {addToolbarDivider()}

      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
        title="Underline (Ctrl+U)"
      >
        <Underline size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      {addToolbarDivider()}

      {/* Text Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>

      {addToolbarDivider()}

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>

      {addToolbarDivider()}

      {/* Insert Tools */}
      <ImageButton editor={editor} />
      <button 
        onClick={() => setShowLinkDialog(true)}
        className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
        title="Insert Link"
      >
        <Link2 size={16} />
      </button>
      <LatexButton editor={editor} />
      <button 
        onClick={() => setShowTableDialog(true)}
        className="toolbar-button"
        title="Insert Table"
      >
        <Table size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
        title="Block Quote"
      >
        <Quote size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
        title="Code Block"
      >
        <Code size={16} />
      </button>

      {addToolbarDivider()}

      {/* Color Pickers */}
      <ColorPicker
        colors={TEXT_COLORS}
        activeColor={TEXT_COLORS[0]}
        onChange={(color) => editor.chain().focus().setColor(color.color).run()}
        icon={Type}
        label="Text Color"
      />

      <ColorPicker
        colors={HIGHLIGHT_COLORS}
        activeColor={HIGHLIGHT_COLORS[0]}
        onChange={(color) => {
          if (color.isNone) {
            editor.chain().focus().unsetHighlight().run();
          } else {
            editor.chain().focus().setHighlight({ color: color.color }).run();
          }
        }}
        icon={Highlighter}
        label="Highlight Color"
        isHighlight={true}
      />

      {addToolbarDivider()}

      {/* Concept Explanation Button */}
      <button
        onClick={onGenerateExplanation}
        disabled={isGenerating}
        className={`toolbar-button ${isGenerating ? 'opacity-50' : ''}`}
        title="Generate Concept Explanation"
      >
        <HelpCircle size={16} />
      </button>

      {/* Dialogs */}
      {showLinkDialog && (
        <LinkDialog
          editor={editor}
          onClose={() => setShowLinkDialog(false)}
        />
      )}

      {showTableDialog && (
        <TableDialog
          editor={editor}
          onClose={() => setShowTableDialog(false)}
        />
      )}
    </div>
  );
};

export default EditorToolbar;