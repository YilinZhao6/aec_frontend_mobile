import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe2, 
  Instagram, 
  Search, 
  Users, 
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Loader2,
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OnboardingState } from '../../types';
import './OnboardingPage.css';

type Step = 'language' | 'source' | 'referral' | 'profile' | 'tutorials';

interface StepConfig {
  title: {
    en: string;
    zh: string;
  };
  subtitle: {
    en: string;
    zh: string;
  };
}

const steps: Record<Step, StepConfig> = {
  language: {
    title: {
      en: "Choose Your Language",
      zh: "选择语言"
    },
    subtitle: {
      en: "Select your preferred language for the best experience",
      zh: "选择您偏好的语言以获得最佳体验"
    }
  },
  source: {
    title: {
      en: "How Did You Find Us?",
      zh: "您是如何找到我们的？"
    },
    subtitle: {
      en: "Help us understand how you discovered Hyperknow",
      zh: "帮助我们了解您是如何发现 Hyperknow 的"
    }
  },
  referral: {
    title: {
      en: "Have a Referral Code?",
      zh: "有邀请码吗？"
    },
    subtitle: {
      en: "Enter your referral code if you have one",
      zh: "如果您有邀请码，请在此输入"
    }
  },
  profile: {
    title: {
      en: "Setup Your Profile",
      zh: "设置您的个人资料"
    },
    subtitle: {
      en: "Help us personalize your learning experience",
      zh: "帮助我们为您提供个性化的学习体验"
    }
  },
  tutorials: {
    title: {
      en: "Quick Start Guide",
      zh: "快速入门指南"
    },
    subtitle: {
      en: "Watch these short tutorials to get started",
      zh: "观看这些简短的教程以开始使用"
    }
  }
};

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState<Step>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'zh'>('en');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [referralCode, setReferralCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<'search' | 'notes'>('search');
  const navigate = useNavigate();

  // Profile state
  const [educationLevel, setEducationLevel] = useState<string[]>([]);
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  const sources = [
    { id: 'campus', icon: BookOpen, label: { en: 'Campus Posters', zh: '校园海报' } },
    { id: 'instagram', icon: Instagram, label: { en: 'Instagram', zh: 'Instagram' } },
    { id: 'rednote', icon: Globe2, label: { en: 'Red Note', zh: '小红书' } },
    { id: 'search', icon: Search, label: { en: 'Google Search', zh: '谷歌搜索' } },
    { id: 'friends', icon: Users, label: { en: 'Friends', zh: '朋友推荐' } },
    { id: 'other', icon: Globe2, label: { en: 'Other', zh: '其他' } }
  ];

  const educationLevels = [
    { key: 'PRIMARY', level: { en: 'Primary School', zh: '小学' } },
    { key: 'MIDDLE', level: { en: 'Middle School', zh: '初中' } },
    { key: 'HIGH', level: { en: 'High School', zh: '高中' } },
    { key: 'UNDERGRADUATE', level: { en: 'Undergraduate', zh: '本科' } },
    { key: 'GRADUATE', level: { en: 'Graduate', zh: '研究生' } },
    { key: 'PHD', level: { en: 'PhD', zh: '博士' } },
    { key: 'POSTDOC', level: { en: 'Postdoctoral', zh: '博士后' } },
    { key: 'RESEARCHER', level: { en: 'Professional Researcher', zh: '专业研究员' } },
    { key: 'PROFESSIONAL', level: { en: 'Industry Professional', zh: '行业专家' } },
    { key: 'EDUCATOR', level: { en: 'Educator', zh: '教育工作者' } }
  ];

  const learningStyles = [
    { key: 'VISUAL', style: { en: 'Visual Learning', zh: '视觉学习' } },
    { key: 'STEP_BY_STEP', style: { en: 'Step-by-step Explanations', zh: '逐步解释' } },
    { key: 'MATH', style: { en: 'Mathematical Formulas', zh: '数学公式' } },
    { key: 'EXAMPLES', style: { en: 'Practical Examples', zh: '实践案例' } },
    { key: 'HISTORY', style: { en: 'Historical Context', zh: '历史背景' } },
    { key: 'DIAGRAMS', style: { en: 'Diagrams & Charts', zh: '图表' } },
    { key: 'INTERACTIVE', style: { en: 'Interactive Elements', zh: '互动元素' } },
    { key: 'CONCEPTUAL', style: { en: 'Conceptual Understanding', zh: '概念理解' } },
    { key: 'TECHNICAL', style: { en: 'Technical Details', zh: '技术细节' } },
    { key: 'OVERVIEW', style: { en: 'Brief Overview First', zh: '先概述后详解' } },
    { key: 'DETAILED', style: { en: 'Detailed Explanations', zh: '详细解释' } },
    { key: 'APPLICATIONS', style: { en: 'Real-world Applications', zh: '实际应用' } },
    { key: 'ANALOGIES', style: { en: 'Analogies & Metaphors', zh: '类比与比喻' } },
    { key: 'PROBLEM_SOLVING', style: { en: 'Problem Solving', zh: '问题解决' } },
    { key: 'PROOF', style: { en: 'Proof-based Learning', zh: '证明推导' } },
    { key: 'EASY', style: { en: 'Easy Language', zh: '简单语言' } }
  ];

  const handleSaveProfile = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      navigate('/login');
      return;
    }

    setIsSaving(true);
    setError(null);

    const preferences = {
      education: {
        level: educationLevel,
        institution,
        field_of_study: fieldOfStudy,
      },
      learning_styles: selectedStyles,
      additional_preferences: additionalPreferences,
    };

    try {
      const response = await fetch('https://backend-ai-cloud-explains.onrender.com/save_user_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          preferences
        }),
      });

      if (response.ok) {
        setCurrentStep('tutorials');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save profile');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'language':
        setCurrentStep('source');
        break;
      case 'source':
        setCurrentStep('referral');
        break;
      case 'referral':
        setCurrentStep('profile');
        break;
      case 'profile':
        handleSaveProfile();
        break;
      case 'tutorials':
        navigate('/');
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'source':
        setCurrentStep('language');
        break;
      case 'referral':
        setCurrentStep('source');
        break;
      case 'profile':
        setCurrentStep('referral');
        break;
      case 'tutorials':
        setCurrentStep('profile');
        break;
    }
  };

  const renderTutorials = () => (
    <div className="tutorials-container fade-in">
      <h1 className="text-2xl font-bold text-gray-800 text-center font-quicksand mb-2">
        {steps.tutorials.title[selectedLanguage]}
      </h1>
      <p className="text-gray-600 text-center mt-2 mb-8 font-quicksand">
        {steps.tutorials.subtitle[selectedLanguage]}
      </p>

      <div className="tutorials-content">
        <div className="tutorials-tabs">
          <button
            className={`tutorial-tab ${activeVideo === 'search' ? 'active' : ''}`}
            onClick={() => setActiveVideo('search')}
          >
            <Search size={20} />
            <span>{selectedLanguage === 'en' ? 'How to Search' : '如何搜索'}</span>
            {activeVideo === 'search' && <ChevronRight size={16} />}
          </button>
          <button
            className={`tutorial-tab ${activeVideo === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveVideo('notes')}
          >
            <BookOpen size={20} />
            <span>{selectedLanguage === 'en' ? 'Taking Notes' : '做笔记'}</span>
            {activeVideo === 'notes' && <ChevronRight size={16} />}
          </button>
        </div>

        <div className="video-container">
          <video
            key={activeVideo}
            src={
              activeVideo === 'search'
                ? 'https://pub-f7839fa8ff4441bf8493cb780a9cb930.r2.dev/explanation_page.mp4'
                : 'https://pub-f7839fa8ff4441bf8493cb780a9cb930.r2.dev/note_page.mp4'
            }
            controls
            autoPlay
            className="tutorial-video"
          />
          <div className="video-description">
            <PlayCircle size={24} className="text-gray-400" />
            <p className="text-sm text-gray-600 font-quicksand">
              {selectedLanguage === 'en'
                ? "Don't worry! You can always find these tutorials later in the Help section."
                : "别担心！这些教程之后可以在帮助部分找到。"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'language':
        return (
          <div className="onboarding-language-selection fade-in">
            <h1 className="text-2xl font-bold text-gray-800 text-center font-quicksand">
              {steps.language.title[selectedLanguage]}
            </h1>
            <p className="text-gray-600 text-center mt-2 font-quicksand">
              {steps.language.subtitle[selectedLanguage]}
            </p>
            <div className="onboarding-language-grid">
              <div 
                className={`onboarding-language-option ${selectedLanguage === 'en' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('en')}
              >
                <Globe2 size={32} className="text-gray-600" />
                <span className="onboarding-language-name">English</span>
                <span className="onboarding-language-native">English</span>
              </div>
              <div 
                className={`onboarding-language-option ${selectedLanguage === 'zh' ? 'selected' : ''}`}
                onClick={() => setSelectedLanguage('zh')}
              >
                <Globe2 size={32} className="text-gray-600" />
                <span className="onboarding-language-name">中文</span>
                <span className="onboarding-language-native">Chinese</span>
              </div>
            </div>
          </div>
        );

      case 'source':
        return (
          <div className="source-selection fade-in">
            <h1 className="text-2xl font-bold text-gray-800 text-center font-quicksand">
              {steps.source.title[selectedLanguage]}
            </h1>
            <p className="text-gray-600 text-center mt-2 font-quicksand">
              {steps.source.subtitle[selectedLanguage]}
            </p>
            <div className="source-grid">
              {sources.map(source => (
                <div
                  key={source.id}
                  className={`source-option ${selectedSource === source.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSource(source.id)}
                >
                  <source.icon size={24} className="source-icon" />
                  <span className="source-name">{source.label[selectedLanguage]}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'referral':
        return (
          <div className="referral-code fade-in">
            <h1 className="text-2xl font-bold text-gray-800 text-center font-quicksand">
              {steps.referral.title[selectedLanguage]}
            </h1>
            <p className="text-gray-600 text-center mt-2 font-quicksand">
              {steps.referral.subtitle[selectedLanguage]}
            </p>
            <input
              type="text"
              className="code-input"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder={selectedLanguage === 'en' ? "Enter code (optional)" : "输入邀请码（选填）"}
            />
          </div>
        );

      case 'profile':
        return (
          <div className="profile-setup fade-in">
            <h1 className="text-2xl font-bold text-gray-800 text-center font-quicksand">
              {steps.profile.title[selectedLanguage]}
            </h1>
            <p className="text-gray-600 text-center mt-2 font-quicksand mb-8">
              {steps.profile.subtitle[selectedLanguage]}
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {selectedLanguage === 'en' ? 'Education Level' : '教育水平'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {educationLevels.map((level) => (
                    <button
                      key={level.key}
                      onClick={() => setEducationLevel(prev => 
                        prev.includes(level.key)
                          ? prev.filter(l => l !== level.key)
                          : [...prev, level.key]
                      )}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        educationLevel.includes(level.key)
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.level[selectedLanguage]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedLanguage === 'en' ? 'Institution' : '院校'}
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all font-quicksand"
                    placeholder={selectedLanguage === 'en' ? 'Enter your institution' : '输入您的院校'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedLanguage === 'en' ? 'Field of Study' : '研究领域'}
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all font-quicksand"
                    placeholder={selectedLanguage === 'en' ? 'Enter your field of study' : '输入您的研究领域'}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  {selectedLanguage === 'en' ? 'Preferred Learning Styles' : '偏好的学习方式'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {learningStyles.map((style) => (
                    <button
                      key={style.key}
                      onClick={() => setSelectedStyles(prev => 
                        prev.includes(style.key)
                          ? prev.filter(s => s !== style.key)
                          : [...prev, style.key]
                      )}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedStyles.includes(style.key)
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {style.style[selectedLanguage]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedLanguage === 'en' ? 'Additional Preferences' : '其他偏好'}
                </label>
                <textarea
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all font-quicksand h-32 resize-none"
                  placeholder={selectedLanguage === 'en' 
                    ? 'Tell us about your preferred way of learning or any specific requirements...'
                    : '告诉我们您喜欢的学习方式或任何特殊需求...'
                  }
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <p className="profile-note">
                {selectedLanguage === 'en' 
                  ? "You can always modify these preferences later in Home → Preferences"
                  : "您可以随时在 首页 → 偏好设置 中修改这些设置"}
              </p>
            </div>
          </div>
        );

      case 'tutorials':
        return renderTutorials();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'language':
        return !!selectedLanguage;
      case 'source':
        return !!selectedSource;
      case 'referral':
        return true;
      case 'profile':
        return educationLevel.length > 0 && selectedStyles.length > 0;
      case 'tutorials':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="onboarding-container">
      {currentStep !== 'language' && (
        <button
          className="back-button"
          onClick={handleBack}
          disabled={isSaving}
        >
          <ArrowLeft size={24} />
        </button>
      )}

      {currentStep !== 'tutorials' && currentStep !== 'profile' && (
        <button
          className="skip-button"
          onClick={() => setCurrentStep('profile')}
        >
          {selectedLanguage === 'en' ? 'Skip' : '跳过'}
        </button>
      )}

      {renderStep()}

      <div className="navigation-container">
        {currentStep !== 'language' && (
          <button 
            className="nav-button back"
            onClick={handleBack}
            disabled={isSaving}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button 
          className="nav-button next"
          onClick={handleNext}
          disabled={!canProceed() || isSaving}
        >
          {currentStep === 'profile' ? (
            isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              selectedLanguage === 'en' ? 'Complete Setup' : '完成设置'
            )
          ) : currentStep === 'tutorials' ? (
            selectedLanguage === 'en' ? 'Start Using Hyperknow' : '开始使用 Hyperknow'
          ) : (
            <ArrowRight size={20} />
          )}
        </button>
      </div>

      <div className="progress-indicator">
        {(['language', 'source', 'referral', 'profile', 'tutorials'] as Step[]).map((step) => (
          <div 
            key={step}
            className={`progress-dot ${currentStep === step ? 'active' : 'inactive'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingPage;