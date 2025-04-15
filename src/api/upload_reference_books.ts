interface Book {
  book_id: string;
  author: string;
  title: string;
  original_filename: string;
  file_size_bytes: number;
  num_pages: number;
  vectorized_at: string;
}

interface BooksResponse {
  success: boolean;
  data?: {
    books: Book[];
  };
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const API_BASE_URL = 'https://backend-ai-cloud-explains.onrender.com';

export const uploadReferenceBooksAPI = {
  getVectorizedBooks: async (userId: string): Promise<BooksResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_vectorized_book_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch books: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch books:', error);
      throw error;
    }
  },

  deleteBook: async (userId: string, bookId: string): Promise<DeleteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete_book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete book: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Return success based on whether we have a success message
      return {
        success: data.success ?? !!data.message,
        message: data.message,
        error: data.error
      };
    } catch (error) {
      console.error('Failed to delete book:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete book'
      };
    }
  },

  uploadAndVectorize: async (userId: string, file: File, onProgress: (progress: number) => void): Promise<DeleteResponse> => {
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      onProgress(10); // Start progress

      const uploadResponse = await fetch(`${API_BASE_URL}/upload_reference_book`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      onProgress(50); // Upload complete

      // Then start vectorization
      const vectorizeResponse = await fetch(`${API_BASE_URL}/generate_vector_embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!vectorizeResponse.ok) {
        throw new Error(`Vectorization failed: ${vectorizeResponse.statusText}`);
      }

      onProgress(100); // Vectorization complete

      return await vectorizeResponse.json();
    } catch (error) {
      console.error('Failed to upload and vectorize book:', error);
      throw error;
    }
  }
};