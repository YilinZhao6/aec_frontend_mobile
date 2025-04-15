import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const QuestionsPanel = () => {
  const [messages, setMessages] = useState([{
    id: 0,
    type: 'assistant',
    content: "👋 Welcome! If you have any questions about the content or need clarification on specific points, feel free to ask here. I'm here to help you understand better!",
    timestamp: new Date().toISOString()
  }]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const userId = localStorage.getItem('user_id');
    const conversationId = localStorage.getItem('current_article_conversation_id');

    if (!userId || !conversationId) {
      console.error('Missing user_id or conversation_id');
      return;
    }

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    setCurrentStreamingMessage('');

    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/ask_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          conversation_id: conversationId,
          question: newMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');
      
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;
        setCurrentStreamingMessage(accumulatedResponse);
      }

      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: accumulatedResponse,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStreamingMessage('');

    } catch (error) {
      console.error('Error in ask_question:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: "I apologize, but I encountered an error processing your question. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.type === 'user' ? (
              <div className="flex justify-end">
                <div className="bg-gray-800 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-sm">
                  <p className="font-quicksand">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-sm border border-gray-200">
                  <ReactMarkdown
                    children={message.content}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className="font-quicksand prose prose-sm max-w-none"
                  />
                  <div className="mt-1 text-xs text-gray-400 font-quicksand">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {currentStreamingMessage && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-sm border border-gray-200">
              <ReactMarkdown
                children={currentStreamingMessage}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                className="font-quicksand prose prose-sm max-w-none"
              />
            </div>
          </div>
        )}
        {isTyping && !currentStreamingMessage && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex space-x-1 bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-gray-200">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all font-quicksand"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isTyping}
            className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuestionsPanel;