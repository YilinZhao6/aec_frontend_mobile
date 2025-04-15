import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Mail, Lock, ArrowLeft, Languages, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAuthAPI } from '../../api/user_auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { AUTH_PAGE_STRINGS } from '../../constants/strings';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      setIsGoogleScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google || !document.getElementById('google-signin')) return;

      try {
        window.google.accounts.id.initialize({
          client_id: '976750923806-crklchaijhc9avntdmbcjnmf9eame6hs.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin'),
          { 
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            width: '100%'
          }
        );
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };

    if (isGoogleScriptLoaded) {
      setTimeout(initializeGoogleSignIn, 100);
    }
  }, [isGoogleScriptLoaded]);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '简体中文' }
  ];

  const handleGoogleResponse = async (response: any) => {
    try {
      const data = await userAuthAPI.googleAuth(response);

      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id.toString());
        localStorage.setItem('user_email', data.email || '');
        localStorage.setItem('user_first_name', data.first_name || '');
        localStorage.setItem('user_last_name', data.last_name || '');
        
        setMessage({ 
          type: 'success', 
          text: t(AUTH_PAGE_STRINGS.LOGIN.SUCCESS)
        });
        
        setTimeout(() => {
          if (data.needs_onboarding) {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || t(AUTH_PAGE_STRINGS.LOGIN.ERROR.INVALID_CREDENTIALS)
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: t(AUTH_PAGE_STRINGS.LOGIN.ERROR.SERVER_ERROR)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await userAuthAPI.login(email, password);

      if (data.user_id) {
        localStorage.setItem('user_id', data.user_id.toString());
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_first_name', data.first_name || '');
        localStorage.setItem('user_last_name', data.last_name || '');
        
        setMessage({ 
          type: 'success', 
          text: t(AUTH_PAGE_STRINGS.LOGIN.SUCCESS)
        });
        
        setTimeout(() => {
          if (data.needs_onboarding) {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || t(AUTH_PAGE_STRINGS.LOGIN.ERROR.INVALID_CREDENTIALS)
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: t(AUTH_PAGE_STRINGS.LOGIN.ERROR.SERVER_ERROR)
      });
    }
  };

  return (
    <div className="login-container">
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

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">{t(AUTH_PAGE_STRINGS.LOGIN.TITLE)}</h1>
          <p className="login-subtitle">{t(AUTH_PAGE_STRINGS.LOGIN.SUBTITLE)}</p>
        </div>

        {message.text && (
          <div className={`alert ${
            message.type === 'success' ? 'alert-success' : 'alert-error'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-group">
          <div className="input-group">
            <label className="input-label">{t(AUTH_PAGE_STRINGS.LOGIN.EMAIL.LABEL)}</label>
            <div className="input-wrapper">
              <input
                type="email"
                required
                className="input-field"
                placeholder={t(AUTH_PAGE_STRINGS.LOGIN.EMAIL.PLACEHOLDER)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="input-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t(AUTH_PAGE_STRINGS.LOGIN.PASSWORD.LABEL)}</label>
            <div className="input-wrapper">
              <input
                type="password"
                required
                className="input-field"
                placeholder={t(AUTH_PAGE_STRINGS.LOGIN.PASSWORD.PLACEHOLDER)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="input-icon" />
            </div>
          </div>

          <button type="submit" className="login-button">
            <LogIn size={20} />
            <span>{t(AUTH_PAGE_STRINGS.LOGIN.SIGN_IN)}</span>
          </button>
        </form>

        <div className="divider">
          <div className="divider-line">
            <div className="divider-line-inner"></div>
          </div>
          <div className="divider-text">
            <span className="divider-text-inner">{t(AUTH_PAGE_STRINGS.LOGIN.OR)}</span>
          </div>
        </div>

        <div id="google-signin" className="w-full flex justify-center mb-6"></div>

        <div className="login-footer">
          <a href="#" className="footer-link">
            {t(AUTH_PAGE_STRINGS.LOGIN.FORGOT_PASSWORD)}
          </a>
          <p className="text-sm text-gray-700">
            {t(AUTH_PAGE_STRINGS.LOGIN.NO_ACCOUNT)}{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-gray-900 hover:underline font-medium"
            >
              {t(AUTH_PAGE_STRINGS.LOGIN.SIGN_UP)}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;