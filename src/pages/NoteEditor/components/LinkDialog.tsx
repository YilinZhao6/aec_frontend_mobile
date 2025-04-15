import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LinkDialogProps {
  editor: any;
  onClose: () => void;
}

const LinkDialog: React.FC<LinkDialogProps> = ({ editor, onClose }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      // Ensure URL has protocol
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      editor.chain().focus().setLink({ href: formattedUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" />
      <div className="dialog-container">
        <div className="dialog-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insert Link</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Insert
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LinkDialog;