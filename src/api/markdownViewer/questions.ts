interface QuestionResponse {
  explanation?: string;
  error?: string;
}

export const questionsAPI = {
  askQuestion: async (userId: string, conversationId: string, question: string): Promise<QuestionResponse> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/ask_in_section_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId,
          question: question
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to ask question:', error);
      throw error;
    }
  },
  
  askStreamingQuestion: async (
    userId: string, 
    conversationId: string, 
    question: string,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/ask_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId,
          question: question
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          if (buffer) {
            onChunk(buffer);
          }
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (line.trim()) {
            onChunk(line);
          }
        }
      }
    } catch (error) {
      console.error('Failed to stream question response:', error);
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }
};