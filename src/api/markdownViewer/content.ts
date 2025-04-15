interface MarkdownResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const contentAPI = {
  getMarkdownContent: async (userId: string, conversationId: string): Promise<MarkdownResponse> => {
    try {
      const url = new URL('https://backend-ai-cloud-explains.onrender.com/article');
      url.searchParams.append('user_id', userId);
      url.searchParams.append('conversation_id', conversationId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const content = await response.text();
      
      return {
        success: true,
        content: content
      };
    } catch (error) {
      console.error('Failed to fetch markdown content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch content'
      };
    }
  }
};