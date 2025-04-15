import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TableDialogProps {
  editor: any;
  onClose: () => void;
}

const TableDialog: React.FC<TableDialogProps> = ({ editor, onClose }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" />
      <div className="dialog-container">
        <div className="dialog-content">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Insert Table</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                />
              </div>
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

export default TableDialog;