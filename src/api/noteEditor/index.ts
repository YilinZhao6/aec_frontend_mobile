import { SaveFileResponse, FileInfoResponse, ConceptExplanationsResponse, ImageUploadResponse } from './types';

const API_BASE_URL = 'https://backend-ai-cloud-explains.onrender.com';

export const noteEditorAPI = {
  saveFile: async (userId: string | number, filename: string, content: string): Promise<SaveFileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/save_file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: `${filename}.md`,
          content: content
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to save file:', error);
      return {
        success: false,
        error: 'Failed to save file',
        file_name: filename
      };
    }
  },

  getFileInfo: async (userId: string | number, filename: string): Promise<FileInfoResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/get_file_info`, {
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

  generateConceptExplanation: async (
    userId: string | number, 
    filename: string, 
    concept: string
  ): Promise<ConceptExplanationsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/generate_concept_explanation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: `${filename}.md`,
          concept: concept,
          occurrence: 1,
          mode: 'fast'
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to generate concept explanation:', error);
      return {
        success: false,
        error: 'Failed to generate explanation'
      };
    }
  },

  getConceptExplanations: async (userId: string | number, filename: string): Promise<ConceptExplanationsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/get_explanation_per_concept`, {
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
  },

  uploadImage: async (userId: string | number, file: File): Promise<ImageUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId.toString());
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/note/upload_images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return {
        success: true,
        url: data.url ? `${API_BASE_URL}${data.url}` : null,
        error: null
      };
    } catch (error) {
      console.error('Failed to upload image:', error);
      return {
        success: false,
        url: null,
        error: 'Failed to upload image'
      };
    }
  }
};