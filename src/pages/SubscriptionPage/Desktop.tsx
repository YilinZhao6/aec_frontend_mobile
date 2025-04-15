import React from 'react';
import { Sparkles, Rocket } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import ParticleBackground from '../../components/ParticleBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import './SubscriptionPage.css';

const STRINGS = {
  TITLE: {
    en: "Premium Features Coming Soon",
    zh: "高级功能即将推出"
  },
  SUBTITLE: {
    en: "We're working on something special for you",
    zh: "我们正在为您准备一些特别的功能"
  },
  FEATURES: {
    PRO_SEARCH: {
      title: { en: "Pro Search", zh: "专业搜索" },
      description: { en: "Enhanced search capabilities with web sources", zh: "增强的搜索功能，包含网络资源" }
    },
    ADVANCED_EXPLANATIONS: {
      title: { en: "Advanced Explanations", zh: "高级解释" },
      description: { en: "Deeper insights and detailed breakdowns", zh: "更深入的见解和详细的分析" }
    },
    PRIORITY_SUPPORT: {
      title: { en: "Priority Support", zh: "优先支持" },
      description: { en: "Get help when you need it most", zh: "在您最需要时获得帮助" }
    },
    CUSTOM_LEARNING: {
      title: { en: "Custom Learning", zh: "自定义学习" },
      description: { en: "Personalized learning paths", zh: "个性化学习路径" }
    }
  }
};

const Desktop = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="subscription-container">
        <div className="coming-soon-content">
          <ParticleBackground />
          
          <div className="coming-soon-card">
            <div className="card-header">
              <Sparkles className="header-icon" size={32} />
              <h1 className="title">{t(STRINGS.TITLE)}</h1>
              <p className="subtitle">{t(STRINGS.SUBTITLE)}</p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <Rocket className="feature-icon" size={20} />
                <div className="feature-text">
                  <h3>{t(STRINGS.FEATURES.PRO_SEARCH.title)}</h3>
                  <p>{t(STRINGS.FEATURES.PRO_SEARCH.description)}</p>
                </div>
              </div>

              <div className="feature-item">
                <Sparkles className="feature-icon" size={20} />
                <div className="feature-text">
                  <h3>{t(STRINGS.FEATURES.ADVANCED_EXPLANATIONS.title)}</h3>
                  <p>{t(STRINGS.FEATURES.ADVANCED_EXPLANATIONS.description)}</p>
                </div>
              </div>

              <div className="feature-item">
                <Rocket className="feature-icon" size={20} />
                <div className="feature-text">
                  <h3>{t(STRINGS.FEATURES.PRIORITY_SUPPORT.title)}</h3>
                  <p>{t(STRINGS.FEATURES.PRIORITY_SUPPORT.description)}</p>
                </div>
              </div>

              <div className="feature-item">
                <Sparkles className="feature-icon" size={20} />
                <div className="feature-text">
                  <h3>{t(STRINGS.FEATURES.CUSTOM_LEARNING.title)}</h3>
                  <p>{t(STRINGS.FEATURES.CUSTOM_LEARNING.description)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Desktop;