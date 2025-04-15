import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, ArrowLeft, Languages, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAuthAPI } from '../../api/user_auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { AUTH_PAGE_STRINGS } from '../../constants/strings';
import './SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '简体中文' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showMessage = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.email !== formData.confirmEmail) {
      showMessage('error', t(AUTH_PAGE_STRINGS.SIGNUP.ERROR.EMAIL_MISMATCH));
      return;
    }

    try {
      const data = await userAuthAPI.signup(formData);

      if (data.message) {
        showMessage('success', t(AUTH_PAGE_STRINGS.SIGNUP.SUCCESS));
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showMessage('error', data.error || t(AUTH_PAGE_STRINGS.SIGNUP.ERROR.SERVER_ERROR));
      }
    } catch (err) {
      showMessage('error', t(AUTH_PAGE_STRINGS.SIGNUP.ERROR.SERVER_ERROR));
    }
  };

  return (
    <div className="signup-container">
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="language-selector" ref={languageButtonRef}>
        <button 
          className="language-button"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
        >
          <Languages size={20} />
          <span className="current-language">{language.toUpperCase()}</span>
          <ChevronDown size={16} />
        </button>

        {showLanguageDropdown && (
          <div className="language-dropdown">
            {languageOptions.map((option) => (
              <div
                key={option.code}
                className={`language-option ${language === option.code ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(option.code as 'en' | 'zh');
                  setShowLanguageDropdown(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">{t(AUTH_PAGE_STRINGS.SIGNUP.TITLE)}</h1>
          <p className="signup-subtitle">{t(AUTH_PAGE_STRINGS.SIGNUP.SUBTITLE)}</p>
        </div>

        {message.text && (
          <div className={`alert ${
            message.type === 'success' ? 'alert-success' : 'alert-error'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="name-group">
            <div className="input-group">
              <label className="input-label">{t(AUTH_PAGE_STRINGS.SIGNUP.FIRST_NAME.LABEL)}</label>
              <div className="input-wrapper">
                <input
                  name="firstName"
                  type="text"
                  required
                  className="input-field"
                  placeholder={t(AUTH_PAGE_STRINGS.SIGNUP.FIRST_NAME.PLACEHOLDER)}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <User className="input-icon" />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">{t(AUTH_PAGE_STRINGS.SIGNUP.LAST_NAME.LABEL)}</label>
              <div className="input-wrapper">
                <input
                  name="lastName"
                  type="text"
                  required
                  className="input-field"
                  placeholder={t(AUTH_PAGE_STRINGS.SIGNUP.LAST_NAME.PLACEHOLDER)}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <User className="input-icon" />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t(AUTH_PAGE_STRINGS.SIGNUP.EMAIL.LABEL)}</label>
            <div className="input-wrapper">
              <input
                name="email"
                type="email"
                required
                className="input-field"
                placeholder={t(AUTH_PAGE_STRINGS.SIGNUP.EMAIL.PLACEHOLDER)}
                value={formData.email}
                onChange={handleChange}
              />
              <Mail className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t(AUTH_PAGE_STRINGS.SIGNUP.CONFIRM_EMAIL.LABEL)}</label>
            <div className="input-wrapper">
              <input
                name="confirmEmail"
                type="email"
                required
                className="input-field"
                placeholder={t(AUTH_PAGE_STRINGS.SIGNUP.CONFIRM_EMAIL.PLACEHOLDER)}
                value={formData.confirmEmail}
                onChange={handleChange}
              />
              <Mail className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t(AUTH_PAGE_STRINGS.SIGNUP.PASSWORD.LABEL)}</label>
            <div className="input-wrapper">
              <input
                name="password"
                type="password"
                required
                className="input-field"
                placeholder={t(AUTH_PAGE_STRINGS.SIGNUP.PASSWORD.PLACEHOLDER)}
                value={formData.password}
                onChange={handleChange}
              />
              <Lock className="input-icon" />
            </div>
          </div>


        
        <button type="submit" className="signup-button">
          <UserPlus size={20} />
          <span>{t(AUTH_PAGE_STRINGS.SIGNUP.CREATE_ACCOUNT)}</span>
        </button>
        </form>

        <div className="signup-footer">
          <p className="text-sm text-gray-700">
            {t(AUTH_PAGE_STRINGS.SIGNUP.HAVE_ACCOUNT)}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-gray-900 hover:underline font-medium"
            >
              {t(AUTH_PAGE_STRINGS.SIGNUP.SIGN_IN)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;