import React from 'react';
import { Laptop } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import './NotesPage.css';

const Desktop = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="notes-container">
        <div className="mobile-notes-message">
          <Laptop size={32} className="text-gray-400" />
          <h2 className="message-title">
            {t({
              en: 'Notes are available on desktop',
              zh: '笔记功能在桌面端可用'
            })}
          </h2>
          <p className="message-text">
            {t({
              en: 'For the best note-taking experience, please use Hyperknow on your desktop browser.',
              zh: '为了获得最佳的笔记体验，请在桌面浏览器上使用 Hyperknow。'
            })}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Desktop;