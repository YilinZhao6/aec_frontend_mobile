import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, FolderPlus, Check, X } from 'lucide-react';

interface FolderRowProps {
  folder: {
    folder_name: string;
    files: string[];
    subfolders: any[];
  };
  path: string;
  isExpanded: boolean;
  isEditing: boolean;
  editInputRef: React.RefObject<HTMLInputElement>;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onSubmitRename: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

const FolderRow: React.FC<FolderRowProps> = ({
  folder,
  path,
  isExpanded,
  isEditing,
  editInputRef,
  onToggle,
  onEdit,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onSubmitRename,
  onCancelEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInputRef.current) return;

    const newName = editInputRef.current.value.trim();
    
    // If name hasn't changed, just cancel editing
    if (newName === folder.folder_name) {
      onCancelEdit();
      return;
    }

    setIsSubmitting(true);
    await onSubmitRename(e);
    setIsSubmitting(false);
  };

  if (folder.folder_name === 'notes') return null;

  return (
    <div className="folder-header">
      <button 
        className="folder-toggle"
        onClick={onToggle}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="rename-form">
          <div className="rename-input-wrapper">
            <input
              ref={editInputRef}
              type="text"
              defaultValue={folder.folder_name}
              className="rename-input"
              onKeyDown={(e) => {
                if (e.key === 'Escape') onCancelEdit();
              }}
              disabled={isSubmitting}
            />
            <div className="rename-controls">
              <button
                type="submit"
                className="rename-control-button text-green-600 hover:text-green-700"
                disabled={isSubmitting}
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rename-control-button text-red-600 hover:text-red-700"
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <>
          <span className="folder-name">{folder.folder_name}</span>
          <span className="folder-count">
            ({folder.files.length + folder.subfolders.length})
          </span>
          <div className="folder-create-actions">
            <button 
              className="folder-create-button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFile();
              }}
              title="New File"
              disabled={isSubmitting}
            >
              <Plus size={14} />
            </button>
            <button 
              className="folder-create-button"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder();
              }}
              title="New Folder"
              disabled={isSubmitting}
            >
              <FolderPlus size={14} />
            </button>
          </div>
          <div className="folder-actions">
            <button 
              className="folder-action-button"
              onClick={onEdit}
              disabled={isSubmitting}
            >
              <Edit2 size={14} />
            </button>
            <button 
              className="folder-action-button"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FolderRow;