import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { ChevronLeft, Save, Loader2, Download, Cloud, Shield } from 'lucide-react';
import { noteEditorAPI } from '../../api/noteEditor';
import EditorToolbar from './EditorToolbar';
import DownloadDialog from './components/DownloadDialog';
import TableOfContents from './components/TableOfContents';
import Ruler from './components/Ruler';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import History from '@tiptap/extension-history';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import { ConceptExtension } from './extensions/ConceptExtension';
import { ImportedContentExtension } from './extensions/ImportedContentExtension';
import { LatexExtension } from './extensions/LatexExtension';
import { ImageResizeExtension } from './extensions/ImageResizeExtension';
import ConceptExplanations from './components/ConceptExplanations';
import ModeSelectionDialog from './components/ModeSelectionDialog';
import RightPanel from './components/RightPanel/RightPanel';
import './NoteEditor.css';

interface Concept {
  concept: string;
  explanation: string;
  tag: string;
  text?: string;
  mode?: 'fast' | 'normal' | 'pro';
}

interface PendingSelection {
  from: number;
  to: number;
  text: string;
}

const NoteEditor = () => {
  const { noteId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('user_id');
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      BulletList,
      OrderedList,
      ListItem,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'resizable-image',
        },
      }),
      ImageResizeExtension.configure({
        minWidth: 100,
        maxWidth: 1000,
      }),
      History.configure({
        depth: 100,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic my-4',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm my-4',
        },
      }),
      ConceptExtension,
      ImportedContentExtension,
      LatexExtension,
    ],
    onCreate({ editor }) {
      editor.on('selectionUpdate', ({ editor }) => {
        const selection = editor.state.selection;
        const node = selection.$anchor.parent;
        if (node.type.name === 'image') {
          const element = document.querySelector(`img[src="${node.attrs.src}"]`);
          if (element) {
            element.classList.add('selected');
          }
        }
      });
    },
  });

  useEffect(() => {
    const loadContent = async () => {
      if (!userId || !noteId || !editor) return;

      try {
        const [contentResponse, explanationsResponse] = await Promise.all([
          noteEditorAPI.getFileInfo(userId, noteId),
          noteEditorAPI.getConceptExplanations(userId, noteId)
        ]);
        
        if (contentResponse.success && contentResponse.content) {
          editor.commands.setContent(contentResponse.content);
        } else {
          setError(contentResponse.error || 'Failed to load content');
        }

        if (explanationsResponse.success && explanationsResponse.explanations) {
          setConcepts(explanationsResponse.explanations);
        }
      } catch (error) {
        setError('Error loading content');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [editor, userId, noteId]);

  useEffect(() => {
    if (!editor) return;

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      handleSave();
    }, 30000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [editor]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  const handleSave = async () => {
    if (!editor || !userId || !noteId || isSaving) return;
    
    setIsSaving(true);
    try {
      const content = editor.getHTML();
      const response = await noteEditorAPI.saveFile(userId, noteId, content);
      
      if (response.success) {
        setSaveSuccess(true);
        setLastSavedTime(formatTime(new Date()));
        
        if (saveButtonRef.current) {
          saveButtonRef.current.classList.add('text-green-500');
          setTimeout(() => {
            saveButtonRef.current?.classList.remove('text-green-500');
            setSaveSuccess(false);
          }, 2000);
        }
      } else {
        setError(response.error || 'Failed to save content');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setError('Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateExplanation = async (mode: 'fast' | 'normal' | 'pro') => {
    if (!editor || !pendingSelection) return;

    const { from, to, text } = pendingSelection;
    setPendingSelection(null);

    if (!text.trim()) return;

    setIsGenerating(true);

    try {
      // Add gray highlight to the selected text while generating
      editor
        .chain()
        .setTextSelection({ from, to })
        .setMark('highlight', { color: '#E5E7EB' })
        .run();

      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/note/generate_concept_explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId || '',
          filename: noteId ? `${noteId}.md` : 'untitled.md',
          concept: text.trim(),
          occurrence: 1,
          mode: mode
        }),
      });

      const data = await response.json();
      
      if (data.success && data.tag) {
        // Remove the gray highlight and add the concept mark without focusing or selecting
        editor
          .chain()
          .setTextSelection({ from, to })
          .unsetMark('highlight')
          .setMark('concept', { 
            tag: data.tag,
            mode: mode
          })
          .run();

        const newConcept = {
          concept: text.trim(),
          explanation: data.explanation || '',
          tag: data.tag,
          mode: mode
        };

        setConcepts(prev => [...prev, newConcept]);
        setSelectedConcept(newConcept);
        handleSave();
      }
    } catch (error) {
      console.error('Error generating concept explanation:', error);
      // Remove the gray highlight if generation fails
      editor
        .chain()
        .setTextSelection({ from, to })
        .unsetMark('highlight')
        .run();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConceptClick = (concept: Concept) => {
    setSelectedConcept(concept);
  };

  const initiateConceptGeneration = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from === to) return;

    const selectedText = editor.state.doc.textBetween(from, to);
    setPendingSelection({ from, to, text: selectedText });
    setShowModeDialog(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={() => navigate('/notes')}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notes')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="editor-title">{noteId}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Cloud className="w-4 h-4" />
            {lastSavedTime && (
              <span className="text-sm text-gray-500">
                Last saved at {lastSavedTime}
              </span>
            )}
            {isSaving && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowDownloadDialog(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
          </button>
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Save className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <EditorToolbar
        editor={editor}
        onGenerateExplanation={initiateConceptGeneration}
        isGenerating={isGenerating}
      />

      <TableOfContents editor={editor} />

      <div className="editor-main">
        <div className="editor-content" ref={editorRef}>
          <Ruler />
          <EditorContent editor={editor} />
          {concepts.length > 0 && (
            <ConceptExplanations
              concepts={concepts}
              editorRef={editorRef}
              onConceptClick={handleConceptClick}
            />
          )}
        </div>
      </div>

      <ModeSelectionDialog
        isOpen={showModeDialog}
        onClose={() => {
          setShowModeDialog(false);
          setPendingSelection(null);
        }}
        onSelect={handleGenerateExplanation}
      />

      <RightPanel
        concept={selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />

      <DownloadDialog
        isOpen={showDownloadDialog}
        onClose={() => setShowDownloadDialog(false)}
        content={editor?.getHTML() || ''}
        fileName={noteId || 'untitled'}
      />
    </div>
  );
};

export default NoteEditor;