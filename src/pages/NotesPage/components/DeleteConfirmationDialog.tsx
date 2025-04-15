import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { NOTES_PAGE_STRINGS } from '../../../constants/strings';

interface DeleteConfirmationDialogProps {
  type: 'file' | 'folder';
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  type,
  onConfirm,
  onCancel,
}) => {
  const { t } = useLanguage();

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation">
        <AlertCircle className="text-red-500" size={24} />
        <p className="confirmation-message">
          {t(type === 'folder' 
            ? NOTES_PAGE_STRINGS.DELETE_CONFIRMATION.FOLDER 
            : NOTES_PAGE_STRINGS.DELETE_CONFIRMATION.FILE)}
        </p>
        <div className="confirmation-actions">
          <button 
            className="cancel-button"
            onClick={onCancel}
          >
            {t(NOTES_PAGE_STRINGS.ACTIONS.CANCEL)}
          </button>
          <button 
            className="delete-button"
            onClick={onConfirm}
          >
            {t(NOTES_PAGE_STRINGS.ACTIONS.DELETE)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;