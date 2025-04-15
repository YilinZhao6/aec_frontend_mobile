interface RatingData {
  userId: string;
  conversationId: string;
  rating: number;
  feedback?: string;
}

interface RatingResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const ratingsAPI = {
  submitRating: async (data: RatingData): Promise<RatingResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/submit_rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }
};