import { SearchParams } from '../types';

interface Book {
  book_id: string;
  author: string;
}

interface BookResponse {
  success: boolean;
  data?: {
    books: Book[];
  };
  message?: string;
}

export const searchAPI = {
  performSearch: async (params: SearchParams) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },

  uploadReferenceBook: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-reference', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  getVectorizedBooks: async (userId: string): Promise<BookResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/get_vectorized_book_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch books:', error);
      throw error;
    }
  }
};