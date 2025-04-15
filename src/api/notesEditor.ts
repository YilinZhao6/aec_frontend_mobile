import { EditorContent } from '@tiptap/react';

interface FileInfoResponse {
  success: boolean;
  content?: string;
  error?: string;
}

interface ConceptExplanation {
  concept: string;
  explanation: string;
  tag: string;
}

interface ExplanationsResponse {
  success: boolean;
  explanations?: ConceptExplanation[];
  error?: string;
}

export const notesEditorAPI = {
  getFileInfo: async (userId: string, filename: string): Promise<FileInfoResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/note/get_file_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: `${filename}.md`
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch file info:', error);
      return {
        success: false,
        error: 'Failed to fetch file content'
      };
    }
  },

  saveFileContent: async (userId: string, filename: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/note/save_file_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: `${filename}.md`,
          content
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to save file:', error);
      return {
        success: false,
        error: 'Failed to save content'
      };
    }
  },

  getConceptExplanations: async (userId: string, filename: string): Promise<ExplanationsResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/note/get_explanation_per_concept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: `${filename}.md`
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch concept explanations:', error);
      return {
        success: false,
        error: 'Failed to fetch explanations'
      };
    }
  }
};