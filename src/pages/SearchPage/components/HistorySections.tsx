import React, { useState, useEffect } from 'react';
import { Clock, LogIn, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import { explanationsAPI } from '../../../api/explanations';
import { SEARCH_PAGE_STRINGS } from '../../../constants/strings';

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

const EmptyStatePrompt = () => {
  const { t } = useLanguage();

  const message = {
    title: {
      en: "Let's take up your first explanation!",
      zh: "让我们开始你的第一个解释！"
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <Search size={24} className="text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-800 font-quicksand text-center">
        {t(message.title)}
      </h3>
    </div>
  );
};

const HistorySections = () => {
  const { t } = useLanguage();
  const [recentExplanations, setRecentExplanations] = useState<Explanation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecentItems = async () => {
      try {
        // Fetch explanations
        const explanationsResponse = await explanationsAPI.getExplanations(userId);
        if (explanationsResponse.success && explanationsResponse.data) {
          // Sort by date and get 2 most recent
          const sortedExplanations = explanationsResponse.data.articles
            .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
            .slice(0, 2);
          setRecentExplanations(sortedExplanations);
        }
      } catch (error) {
        console.error('Error fetching recent items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).toLowerCase()
    };
  };

  const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg p-6 space-y-4">
      <LogIn size={24} className="text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-800 font-quicksand text-center">
        {t(SEARCH_PAGE_STRINGS.LOGIN_PROMPT.TITLE)}
      </h3>
      <p className="text-gray-600 text-sm font-quicksand text-center">
        {t(SEARCH_PAGE_STRINGS.LOGIN_PROMPT.DESCRIPTION)}
      </p>
      <button
        onClick={() => navigate('/login')}
        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-quicksand font-medium text-sm"
      >
        {t(SEARCH_PAGE_STRINGS.NAVIGATION.SIGN_IN)}
      </button>
    </div>
  );

  return (
    <div className="history-section">
      <div className="history-header">
        <h2 className="history-title">{t(SEARCH_PAGE_STRINGS.HISTORY.EXPLANATIONS.TITLE)}</h2>
      </div>
      <div className="history-list">
        {!userId ? (
          <LoginPrompt />
        ) : recentExplanations.length === 0 ? (
          <EmptyStatePrompt />
        ) : (
          recentExplanations.map((explanation) => {
            const { date, time } = formatDate(explanation.generated_at);
            return (
              <div key={explanation.conversation_id} className="history-item">
                <div className="history-content">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="history-item-title">{explanation.topic}</h3>
                    <button
                      onClick={() => navigate(`/markdown-viewer/explanations/${explanation.user_id}/${explanation.conversation_id}`)}
                      className="px-3 py-1 border border-gray-400 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors font-quicksand font-medium"
                    >
                      {t(SEARCH_PAGE_STRINGS.HISTORY.OPEN)}
                    </button>
                  </div>
                  <div className="history-meta flex items-center justify-between">
                    <span className="text-gray-500">{date} • {time}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default HistorySections;