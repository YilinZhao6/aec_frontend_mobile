import React from 'react';
import { X, FileDown, FileText, FileCode } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  fileName: string;
}

const DownloadDialog: React.FC<DownloadDialogProps> = ({
  isOpen,
  onClose,
  content,
  fileName
}) => {
  if (!isOpen) return null;

  const downloadAsPDF = async () => {
    const element = document.createElement('div');
    element.innerHTML = content;
    element.style.padding = '20px';
    
    const opt = {
      margin: 1,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      onClose();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const downloadAsMarkdown = () => {
    // Convert HTML to Markdown (basic conversion)
    let markdown = content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const downloadAsDocx = async () => {
    // Convert HTML to plain text (basic conversion)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    // Create a new document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun(plainText)
            ],
          }),
        ],
      }],
    });

    // Generate and save the document
    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${fileName}.docx`);
      onClose();
    } catch (error) {
      console.error('Error generating DOCX:', error);
    }
  };

  return (
    <>
      <div className="modal-overlay" />
      <div className="dialog-container">
        <div className="dialog-content">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 font-quicksand">Download Note</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={downloadAsMarkdown}
              className="w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <FileCode className="w-5 h-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium font-quicksand">Markdown (Recommended)</div>
                <div className="text-sm text-gray-600 font-quicksand">Plain text with basic formatting</div>
              </div>
            </button>

            <button
              onClick={downloadAsDocx}
              className="w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <FileText className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium font-quicksand">Word Document (Recommended)</div>
                <div className="text-sm text-gray-600 font-quicksand">Compatible with Microsoft Word</div>
              </div>
            </button>

            <button
              onClick={downloadAsPDF}
              className="w-full p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <FileDown className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium font-quicksand">PDF Document</div>
                <div className="text-sm text-gray-600 font-quicksand">Best for printing and sharing</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadDialog;