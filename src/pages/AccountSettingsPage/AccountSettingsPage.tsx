import React, { useState, useEffect } from 'react';
import { Settings, FileText, MessageSquare, AlertTriangle, Loader2, LogOut, Trash2 } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import ParticleBackground from '../../components/ParticleBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import { notesAPI } from '../../api/notes';
import { explanationsAPI } from '../../api/explanations';
import './AccountSettingsPage.css';

interface AccountStrings {
  TITLE: { en: string; zh: string };
  STATS: {
    TOTAL_NOTES: { en: string; zh: string };
    TOTAL_CONVERSATIONS: { en: string; zh: string };
  };
  ACTIONS: {
    CHANGE_EMAIL: { en: string; zh: string };
    CHANGE_PASSWORD: { en: string; zh: string };
    MANAGE_SUBSCRIPTION: { en: string; zh: string };
    USER_POLICY: { en: string; zh: string };
    SIGN_OUT: { en: string; zh: string };
    DELETE_ACCOUNT: { en: string; zh: string };
  };
  COMING_SOON: { en: string; zh: string };
}

const STRINGS: AccountStrings = {
  TITLE: {
    en: "Account Settings",
    zh: "账户设置"
  },
  STATS: {
    TOTAL_NOTES: {
      en: "Total Notes",
      zh: "笔记总数"
    },
    TOTAL_CONVERSATIONS: {
      en: "Total Conversations",
      zh: "对话总数"
    }
  },
  ACTIONS: {
    CHANGE_EMAIL: {
      en: "Change Email",
      zh: "更改邮箱"
    },
    CHANGE_PASSWORD: {
      en: "Change Password",
      zh: "更改密码"
    },
    MANAGE_SUBSCRIPTION: {
      en: "Manage Subscription",
      zh: "管理订阅"
    },
    USER_POLICY: {
      en: "User Policy",
      zh: "用户协议"
    },
    SIGN_OUT: {
      en: "Sign Out",
      zh: "退出登录"
    },
    DELETE_ACCOUNT: {
      en: "Delete Account",
      zh: "删除账号"
    }
  },
  COMING_SOON: {
    en: "Coming soon!",
    zh: "即将推出！"
  }
};

const AccountSettingsPage = () => {
  const { t } = useLanguage();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState('');
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const userFirstName = localStorage.getItem('user_first_name') || '';
  const userLastName = localStorage.getItem('user_last_name') || '';
  const userEmail = localStorage.getItem('user_email') || '';
  const userId = localStorage.getItem('user_id');

  const getInitials = () => {
    return `${userFirstName.charAt(0)}${userLastName.charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // Fetch notes count
        const notesResponse = await notesAPI.getNoteTree(userId);
        if (notesResponse.success && notesResponse.folder_tree) {
          let count = notesResponse.folder_tree.files.length;
          const countFolderFiles = (folders: any[]) => {
            folders.forEach(folder => {
              count += folder.files.length;
              if (folder.subfolders) {
                countFolderFiles(folder.subfolders);
              }
            });
          };
          countFolderFiles(notesResponse.folder_tree.folders);
          setTotalNotes(count);
        }

        // Fetch conversations count
        const conversationsResponse = await explanationsAPI.getExplanations(userId);
        if (conversationsResponse.success && conversationsResponse.data) {
          setTotalConversations(conversationsResponse.data.articles.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const handleActionClick = (message: string) => {
    setComingSoonMessage(t(STRINGS.COMING_SOON));
    setShowComingSoon(true);
    setTimeout(() => {
      setShowComingSoon(false);
      setComingSoonMessage('');
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="account-settings-container">
        <div className="account-settings-header">
          <h1 className="page-title">{t(STRINGS.TITLE)}</h1>
        </div>

        <div className="account-settings-content">
          <ParticleBackground />
          
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-container">
                <div className="avatar">
                  <span className="avatar-text">{getInitials()}</span>
                </div>
              </div>
              
              <div className="profile-info">
                <h2 className="profile-name">{`${userFirstName} ${userLastName}`}</h2>
                <p className="profile-email">{userEmail}</p>
                <span className="subscription-badge basic">
                  Basic Plan
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="stats-loading">
                <Loader2 className="animate-spin" size={20} />
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{totalNotes}</div>
                  <div className="stat-label">{t(STRINGS.STATS.TOTAL_NOTES)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalConversations}</div>
                  <div className="stat-label">{t(STRINGS.STATS.TOTAL_CONVERSATIONS)}</div>
                </div>
              </div>
            )}

            <div className="account-actions">
              <button 
                className="action-button"
                onClick={() => handleActionClick('email')}
              >
                <Settings size={18} />
                <span>{t(STRINGS.ACTIONS.CHANGE_EMAIL)}</span>
              </button>

              <button 
                className="action-button"
                onClick={() => handleActionClick('password')}
              >
                <Settings size={18} />
                <span>{t(STRINGS.ACTIONS.CHANGE_PASSWORD)}</span>
              </button>

              <button 
                className="action-button"
                onClick={() => handleActionClick('subscription')}
              >
                <Settings size={18} />
                <span>{t(STRINGS.ACTIONS.MANAGE_SUBSCRIPTION)}</span>
              </button>

              <button 
                className="action-button"
                onClick={() => handleActionClick('policy')}
              >
                <FileText size={18} />
                <span>{t(STRINGS.ACTIONS.USER_POLICY)}</span>
              </button>

              <button 
                className="action-button warning"
                onClick={() => handleActionClick('signout')}
              >
                <LogOut size={18} />
                <span>{t(STRINGS.ACTIONS.SIGN_OUT)}</span>
              </button>

              <button 
                className="action-button danger"
                onClick={() => handleActionClick('delete')}
              >
                <Trash2 size={18} />
                <span>{t(STRINGS.ACTIONS.DELETE_ACCOUNT)}</span>
              </button>
            </div>

            {showComingSoon && (
              <div className="coming-soon-alert">
                <AlertTriangle size={16} />
                <span>{comingSoonMessage}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSettingsPage;