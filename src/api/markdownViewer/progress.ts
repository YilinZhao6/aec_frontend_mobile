interface Section {
  section_id: string;
  title: string;
  learning_goals: string[];
  status: 'waiting' | 'text_complete' | 'complete';
}

interface ProgressResponse {
  outline?: {
    sections: Section[];
  };
  sections?: Section[];
  is_complete?: boolean;
}

export const progressAPI = {
  getSectionProgress: async (userId: string, conversationId: string): Promise<ProgressResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/get_section_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching section progress:', error);
      throw error;
    }
  }
};