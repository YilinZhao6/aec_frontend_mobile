import React, { useState } from 'react';
import { FunctionSquare as Functions } from 'lucide-react';
import LatexEditor from './LatexEditor';

interface LatexButtonProps {
  editor: any;
}

const LatexButton: React.FC<LatexButtonProps> = ({ editor }) => {
  const [showLatexEditor, setShowLatexEditor] = useState(false);

  const handleLatexInsert = (formula: string) => {
    if (editor) {
      editor.chain().focus().setLatex({ formula }).run();
    }
  };

  return (
    <>
      <button
        onClick={() => setShowLatexEditor(true)}
        className="p-2 rounded hover:bg-gray-100"
        title="Insert LaTeX Formula"
      >
        <Functions className="w-4 h-4" />
      </button>

      {showLatexEditor && (
        <LatexEditor
          onInsert={handleLatexInsert}
          onClose={() => setShowLatexEditor(false)}
        />
      )}
    </>
  );
};

export default LatexButton;