import React, { useState } from 'react';
import { FileText, Edit2, Trash2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { NOTES_PAGE_STRINGS } from '../../../constants/strings';

interface FileRowProps {
  file: {
    file_name: string;
    created_at: string;
    last_modified: string;
  };
  path: string;
  isEditing: boolean;
  editInputRef: React.RefObject<HTMLInputElement>;
  onEdit: () => void;
  onDelete: () => void;
  onSubmitRename: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

const FileRow: React.FC<FileRowProps> = ({
  file,
  path,
  isEditing,
  editInputRef,
  onEdit,
  onDelete,
  onSubmitRename,
  onCancelEdit,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userFirstName = localStorage.getItem('user_first_name') || '';
  const userLastName = localStorage.getItem('user_last_name') || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInputRef.current) return;

    const newName = editInputRef.current.value.trim();
    const currentName = file.file_name.replace('.md', '');

    if (newName === currentName) {
      onCancelEdit();
      return;
    }

    setIsSubmitting(true);
    await onSubmitRename(e);
    setIsSubmitting(false);
  };

  return (
    <div className="note-row">
      <div className="name-cell">
        <FileText size={16} />
        {isEditing ? (
          <form onSubmit={handleSubmit} className="rename-form">
            <div className="rename-input-wrapper">
              <input
                ref={editInputRef}
                type="text"
                defaultValue={file.file_name.replace('.md', '')}
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
          <span className="note-title">{file.file_name.replace('.md', '')}</span>
        )}
      </div>
      <div className="created-cell">
        <span>{formatDate(file.created_at)}</span>
      </div>
      <div className="meta-cell">
        <span>{formatDate(file.last_modified || file.created_at)}</span>
      </div>
      <div className="meta-cell">
        <span>{`${userFirstName} ${userLastName}`}</span>
      </div>
      <div className="actions-cell">
        <button 
          className="px-3 py-1 border border-gray-400 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors font-quicksand font-medium"
          onClick={() => navigate(`/notes/editor/${file.file_name.replace('.md', '')}`)}
        >
          {t(NOTES_PAGE_STRINGS.ACTIONS.OPEN)}
        </button>
        <button 
          className="note-action-button"
          onClick={onEdit}
          disabled={isSubmitting}
          title={t(NOTES_PAGE_STRINGS.ACTIONS.EDIT)}
        >
          <Edit2 size={14} />
        </button>
        <button 
          className="note-action-button"
          onClick={onDelete}
          disabled={isSubmitting}
          title={t(NOTES_PAGE_STRINGS.ACTIONS.DELETE)}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default FileRow;