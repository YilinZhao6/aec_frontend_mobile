import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Home, 
  CreditCard, 
  Bug, 
  Languages, 
  Menu,
  X,
  Sliders
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { SEARCH_PAGE_STRINGS } from '../../constants/strings';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const isLoggedIn = !!localStorage.getItem('user_id');

  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_first_name');
      localStorage.removeItem('user_last_name');
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageButtonRef.current && !languageButtonRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '简体中文' }
  ];

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="mobile-actions">
          <div className="relative" ref={languageButtonRef}>
            <button 
              className="language-button"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Languages size={18} />
              <span className="current-language">{language === 'en' ? 'EN' : '中文'}</span>
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
          
          <button 
            className="sign-in-button"
            onClick={handleAuthClick}
          >
            {isLoggedIn ? t(SEARCH_PAGE_STRINGS.NAVIGATION.SIGN_OUT) : t(SEARCH_PAGE_STRINGS.NAVIGATION.SIGN_IN)}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <div className="nav-sections">
          <div className="nav-section">
            <Link to="/" className="nav-link"><Home size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.HOME)}</Link>
            <Link to="/notes" className="nav-link"><FileText size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.NOTES)}</Link>
            <Link to="/explanations" className="nav-link"><MessageSquare size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.EXPLANATIONS)}</Link>
            <Link to="/reference-books" className="nav-link"><BookOpen size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.REFERENCE_BOOKS)}</Link>
            <Link to="/preferences" className="nav-link"><Sliders size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.PREFERENCES)}</Link>
            <Link to="/subscription" className="nav-link"><CreditCard size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.SUBSCRIPTION)}</Link>
            <Link to="/account-settings" className="nav-link"><Settings size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.ACCOUNT_SETTINGS)}</Link>
            <Link to="/report-bug" className="nav-link"><Bug size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.REPORT_BUG)}</Link>
            <Link to="/community" className="nav-link"><MessageSquare size={18} /> {t(SEARCH_PAGE_STRINGS.NAVIGATION.COMMUNITY_CHANNELS)}</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="white-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;