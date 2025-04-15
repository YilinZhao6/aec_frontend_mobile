interface Explanation {
  article_path: string;
  character_count: number;
  conversation_id: string;
  estimated_reading_time: number;
  generated_at: string;
  topic: string;
  user_id: string;
  word_count: number;
}

interface ExplanationsResponse {
  success: boolean;
  data?: {
    articles: Explanation[];
  };
  message?: string;
}

interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const explanationsAPI = {
  getExplanations: async (userId: string): Promise<ExplanationsResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/get_generated_explanations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch explanations:', error);
      throw error;
    }
  },

  deleteExplanation: async (userId: string, conversationId: string): Promise<DeleteResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/delete_conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId
        }),
      });

      const data = await response.json();

      // If the response has a message property, it was successful
      if (data.message) {
        return {
          success: true,
          message: data.message
        };
      }

      // If we have an error property, return it
      if (data.error) {
        return {
          success: false,
          error: data.error
        };
      }

      // Fallback error case
      return {
        success: false,
        error: 'Unknown error occurred'
      };
    } catch (error) {
      console.error('Failed to delete explanation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete explanation'
      };
    }
  }
};