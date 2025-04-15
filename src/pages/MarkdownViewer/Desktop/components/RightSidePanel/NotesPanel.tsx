import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Loader2, ChevronRight, ChevronDown, Folder, X, Check } from 'lucide-react';
import { notesAPI } from '../../../../../api/notes';

interface NoteFile {
  file_name: string;
  created_at: string;
  last_modified: string;
}

interface NoteFolder {
  folder_name: string;
  created_at: string;
  files: NoteFile[];
  subfolders: NoteFolder[];
}

interface FolderTree {
  files: NoteFile[];
  folders: NoteFolder[];
}

const NotesPanel = () => {
  const [note, setNote] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [selectedNote, setSelectedNote] = useState<{ name: string; path: string } | null>(null);
  const [folderTree, setFolderTree] = useState<FolderTree | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isNotificationExiting, setIsNotificationExiting] = useState(false);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    fetchNotes();

    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection) {
        const text = selection.toString().trim();
        setSelectedText(text);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const fetchNotes = async () => {
    if (!userId) return;

    try {
      const response = await notesAPI.getNoteTree(userId);
      if (response.success && response.folder_tree) {
        setFolderTree(response.folder_tree);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddToNote = async () => {
    if (!selectedNote || !userId) return;
    
    const content = selectedText || note;
    if (!content) return;

    setLoading(true);
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/note/add_content_to_notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          note_filename: selectedNote.name,
          note_content: content
        })
      });

      if (response.ok) {
        if (selectedText) {
          setSelectedText('');
          window.getSelection()?.removeAllRanges();
        }
        setNote('');
        showSuccessMessage(`Added to ${selectedNote.name}`);
      }
    } catch (error) {
      console.error('Error adding to note:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setIsNotificationExiting(false);
    
    setTimeout(() => {
      setIsNotificationExiting(true);
      setTimeout(() => {
        setSuccessMessage('');
        setIsNotificationExiting(false);
      }, 300);
    }, 2000);
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderFileTree = (item: NoteFolder, path: string = '') => {
    const currentPath = path ? `${path}/${item.folder_name}` : item.folder_name;
    const isExpanded = expandedFolders.has(currentPath);
    
    return (
      <div key={currentPath} className="ml-2">
        <button
          onClick={() => toggleFolder(currentPath)}
          className="flex items-center gap-2 px-2 py-1.5 w-full hover:bg-gray-100 rounded text-left"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
          <Folder className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-quicksand truncate">{item.folder_name}</span>
        </button>
        
        {isExpanded && (
          <div className="ml-4">
            {item.files?.map(file => (
              <button
                key={file.file_name}
                onClick={() => {
                  setSelectedNote({ name: file.file_name, path: currentPath });
                  setShowNoteSelector(false);
                }}
                className={`flex items-center gap-2 px-2 py-1.5 w-full hover:bg-gray-100 rounded text-left ${
                  selectedNote?.name === file.file_name ? 'bg-gray-100' : ''
                }`}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-quicksand truncate">
                  {file.file_name.replace('.md', '')}
                </span>
              </button>
            ))}
            {item.subfolders?.map(subfolder => renderFileTree(subfolder, currentPath))}
          </div>
        )}
      </div>
    );
  };

  const renderRootFiles = (files: NoteFile[]) => {
    return files.map(file => (
      <button
        key={file.file_name}
        onClick={() => {
          setSelectedNote({ name: file.file_name, path: '' });
          setShowNoteSelector(false);
        }}
        className={`flex items-center gap-2 px-2 py-1.5 w-full hover:bg-gray-100 rounded text-left ${
          selectedNote?.name === file.file_name ? 'bg-gray-100' : ''
        }`}
      >
        <FileText className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-quicksand truncate">
          {file.file_name.replace('.md', '')}
        </span>
      </button>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Note Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700 font-quicksand">Current Note:</span>
            <span className="ml-2 text-sm text-gray-600 font-quicksand">
              {selectedNote ? selectedNote.name.replace('.md', '') : 'None selected'}
            </span>
          </div>
          <button
            onClick={() => setShowNoteSelector(!showNoteSelector)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 font-quicksand"
          >
            Select Note
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Note Tree */}
        {showNoteSelector && (
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg h-48 overflow-y-auto">
            {/* Root Files */}
            {folderTree?.files && folderTree.files.length > 0 && (
              <div className="mb-2">
                {renderRootFiles(folderTree.files)}
              </div>
            )}
            
            {/* Folders */}
            {folderTree?.folders.map(folder => renderFileTree(folder))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Notes Input */}
        <div className="p-4 border-b border-gray-200">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none h-24 text-sm text-gray-700 font-quicksand focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
          />
        </div>

        {/* Selected Text Display */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 font-quicksand">Selected Text</span>
            {selectedText && (
              <button
                onClick={() => setSelectedText('')}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 font-quicksand bg-gray-50 rounded-lg p-3 border border-gray-200">
            {selectedText || "No text selected"}
          </div>
        </div>
      </div>

      {/* Add Button with Success Message */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {successMessage && (
          <div className={`mb-3 transform transition-all duration-300 ease-in-out ${
            isNotificationExiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
          }`}>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
              <Check className="w-4 h-4" />
              <span className="font-quicksand">{successMessage}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleAddToNote}
          disabled={!selectedNote || (!note && !selectedText) || loading}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 transition-colors font-quicksand font-medium"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Note</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NotesPanel;