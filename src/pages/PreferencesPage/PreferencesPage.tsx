import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import ParticleBackground from '../../components/ParticleBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import { PREFERENCES_PAGE_STRINGS } from '../../constants/strings';
import './PreferencesPage.css';

const PreferencesPage = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('education');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [educationLevel, setEducationLevel] = useState<string[]>([]);
  const [institution, setInstitution] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [additionalPreferences, setAdditionalPreferences] = useState('');
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  const learningStyles = [
    { key: 'VISUAL', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.VISUAL },
    { key: 'STEP_BY_STEP', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.STEP_BY_STEP },
    { key: 'MATH', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.MATH },
    { key: 'EXAMPLES', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.EXAMPLES },
    { key: 'HISTORY', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.HISTORY },
    { key: 'DIAGRAMS', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.DIAGRAMS },
    { key: 'INTERACTIVE', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.INTERACTIVE },
    { key: 'CONCEPTUAL', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.CONCEPTUAL },
    { key: 'TECHNICAL', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.TECHNICAL },
    { key: 'OVERVIEW', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.OVERVIEW },
    { key: 'DETAILED', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.DETAILED },
    { key: 'APPLICATIONS', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.APPLICATIONS },
    { key: 'ANALOGIES', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.ANALOGIES },
    { key: 'PROBLEM_SOLVING', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.PROBLEM_SOLVING },
    { key: 'PROOF', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.PROOF },
    { key: 'EASY', style: PREFERENCES_PAGE_STRINGS.LEARNING.STYLES.EASY },
  ];

  const educationLevels = [
    { key: 'PRIMARY', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.PRIMARY },
    { key: 'MIDDLE', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.MIDDLE },
    { key: 'HIGH', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.HIGH },
    { key: 'UNDERGRADUATE', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.UNDERGRADUATE },
    { key: 'GRADUATE', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.GRADUATE },
    { key: 'PHD', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.PHD },
    { key: 'POSTDOC', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.POSTDOC },
    { key: 'RESEARCHER', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.RESEARCHER },
    { key: 'PROFESSIONAL', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.PROFESSIONAL },
    { key: 'EDUCATOR', level: PREFERENCES_PAGE_STRINGS.EDUCATION.LEVELS.EDUCATOR },
  ];

  const fetchUserPreferences = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const response = await fetch(`https://backend-ai-cloud-explains.onrender.com/get_user_profile?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const preferences = data.preferences;

        setEducationLevel(preferences.education.level || []);
        setInstitution(preferences.education.institution || '');
        setFieldOfStudy(preferences.education.field_of_study || '');
        setSelectedStyles(preferences.learning_styles || []);
        setAdditionalPreferences(preferences.additional_preferences || '');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleSavePreferences = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

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
        body: JSON.stringify({ user_id: userId, preferences }),
      });

      if (response.ok) {
        setShowSavedAlert(true);
        setTimeout(() => setShowSavedAlert(false), 2000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  useEffect(() => {
    fetchUserPreferences();
  }, []);

  const BubbleSelection = ({ items, selected, onSelect }: {
    items: { key: string; style?: any; level?: any }[];
    selected: string[];
    onSelect: (item: string) => void;
  }) => (
    <div className="selection-grid">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={() => onSelect(item.key)}
          className={`selection-item ${
            selected.includes(item.key) ? 'selected' : 'unselected'
          }`}
        >
          {t(item.style || item.level)}
        </button>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="preferences-container">
        <ParticleBackground />
        
        <div className="preferences-header">
          <h1 className="page-title">{t(PREFERENCES_PAGE_STRINGS.PAGE_TITLE)}</h1>
          <p className="page-subtitle">{t(PREFERENCES_PAGE_STRINGS.PAGE_SUBTITLE)}</p>
        </div>

        <div className="preferences-content">
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab('education')}
              className={`tab-button ${
                activeTab === 'education' ? 'active' : 'inactive'
              }`}
            >
              {t(PREFERENCES_PAGE_STRINGS.TABS.EDUCATION)}
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`tab-button ${
                activeTab === 'learning' ? 'active' : 'inactive'
              }`}
            >
              {t(PREFERENCES_PAGE_STRINGS.TABS.LEARNING)}
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === 'education' && (
              <div className="form-section">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {t(PREFERENCES_PAGE_STRINGS.EDUCATION.LEVEL_TITLE)}
                  </h3>
                  <BubbleSelection
                    items={educationLevels}
                    selected={educationLevel}
                    onSelect={(item) =>
                      setEducationLevel((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                      )
                    }
                  />
                </div>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="input-label">
                      {t(PREFERENCES_PAGE_STRINGS.EDUCATION.INSTITUTION.LABEL)}
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="text-input"
                      placeholder={t(PREFERENCES_PAGE_STRINGS.EDUCATION.INSTITUTION.PLACEHOLDER)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="input-label">
                      {t(PREFERENCES_PAGE_STRINGS.EDUCATION.FIELD.LABEL)}
                    </label>
                    <input
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      className="text-input"
                      placeholder={t(PREFERENCES_PAGE_STRINGS.EDUCATION.FIELD.PLACEHOLDER)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning' && (
              <div className="form-section">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    {t(PREFERENCES_PAGE_STRINGS.LEARNING.STYLES_TITLE)}
                  </h3>
                  <BubbleSelection
                    items={learningStyles}
                    selected={selectedStyles}
                    onSelect={(item) =>
                      setSelectedStyles((prev) =>
                        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                      )
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="input-label">
                    {t(PREFERENCES_PAGE_STRINGS.LEARNING.ADDITIONAL.LABEL)}
                  </label>
                  <textarea
                    value={additionalPreferences}
                    onChange={(e) => setAdditionalPreferences(e.target.value)}
                    className="textarea-input"
                    placeholder={t(PREFERENCES_PAGE_STRINGS.LEARNING.ADDITIONAL.PLACEHOLDER)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSavePreferences}
              className="save-button"
            >
              {t(PREFERENCES_PAGE_STRINGS.ACTIONS.SAVE)}
            </button>
          </div>
        </div>

        {showSavedAlert && (
          <div className="save-alert">
            {t(PREFERENCES_PAGE_STRINGS.MESSAGES.SAVE_SUCCESS)}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PreferencesPage;