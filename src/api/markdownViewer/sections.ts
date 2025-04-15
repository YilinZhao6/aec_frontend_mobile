import { SectionResponse } from '../../types/markdown';

export const sectionsAPI = {
  getSections: async (userId: string, conversationId: string): Promise<SectionResponse> => {
    try {
      // Log the parameters being used
      console.log('Fetching sections with params:', {
        userId,
        conversationId,
      });

      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/get_section_progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId
        })
      });

      // Log the response status and headers
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status}\nResponse: ${errorText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        sections: data.sections || [],
        error: undefined
      };
    } catch (error) {
      console.error('Failed to fetch sections:', {
        error,
        userId,
        conversationId,
        endpoint: 'https://backend-ai-cloud-explains.onrender.com/get_section_progress'
      });
      throw error;
    }
  }
};