import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import ParticleBackground from '../../components/ParticleBackground';
import { useLanguage } from '../../contexts/LanguageContext';
import './CommunityPage.css';

interface SocialPlatform {
  name: string;
  logo: string;
  qrCode?: string;
  link?: string;
  description: { en: string; zh: string };
}

const STRINGS = {
  TITLE: {
    en: "Join Our Community",
    zh: "加入我们的社区"
  },
  SUBTITLE: {
    en: "Connect with us across different platforms",
    zh: "在不同平台上与我们联系"
  },
  SCAN_TO_JOIN: {
    en: "Scan to Join",
    zh: "扫码加入"
  },
  JOIN_NOW: {
    en: "Join Now",
    zh: "立即加入"
  }
};

const platforms: SocialPlatform[] = [
  {
    name: 'Discord',
    logo: '/community_channels/discord_logo.png',
    link: 'https://discord.gg/a6M6ckCRdM',
    description: {
      en: "Join our Discord community for real-time discussions and support",
      zh: "加入我们的 Discord 社区，获取实时讨论和支持"
    }
  },
  {
    name: 'LinkedIn',
    logo: '/community_channels/linkedin_logo.png',
    link: 'https://www.linkedin.com/company/hyper-know',
    description: {
      en: "Follow us on LinkedIn for company updates and career opportunities",
      zh: "在 LinkedIn 上关注我们，了解公司动态和职业机会"
    }
  },
  {
    name: 'Instagram',
    logo: '/community_channels/instagram_logo.png',
    qrCode: '/community_channels/instagram_qrcode.png',
    description: {
      en: "Follow our Instagram for visual updates and community highlights",
      zh: "关注我们的 Instagram，获取视觉更新和社区亮点"
    }
  },
  {
    name: 'WeChat',
    logo: '/community_channels/wechat_logo.png',
    qrCode: '/community_channels/wechat_qrcode.jpg',
    description: {
      en: "Join our WeChat group for Chinese community discussions",
      zh: "加入我们的微信群，参与中文社区讨论"
    }
  },
  {
    name: 'Red Note',
    logo: '/community_channels/rednote_logo.png',
    qrCode: '/community_channels/rednote_qrcode.svg',
    description: {
      en: "Follow our Red Note for Chinese content and updates",
      zh: "关注我们的小红书，获取中文内容和更新"
    }
  }
];

const CommunityPage = () => {
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();

  // Prevent initial animation by waiting for component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <MainLayout>
        <div className="community-container">
          <div className="community-header">
            <h1 className="page-title">{t(STRINGS.TITLE)}</h1>
            <p className="page-subtitle">{t(STRINGS.SUBTITLE)}</p>
          </div>
          <div className="platforms-grid">
            {platforms.map((platform) => (
              <div key={platform.name} className="platform-card">
                <div className="card-face card-front">
                  <img 
                    src={platform.logo} 
                    alt={platform.name} 
                    className="platform-logo"
                  />
                  <h3 className="platform-name">{platform.name}</h3>
                </div>
                <div className="card-face card-back" />
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="community-container">
        <div className="community-content">
          <ParticleBackground />
          
          <div className="community-header">
            <h1 className="page-title">{t(STRINGS.TITLE)}</h1>
            <p className="page-subtitle">{t(STRINGS.SUBTITLE)}</p>
          </div>

          <div className="platforms-grid">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className={`platform-card ${flippedCard === platform.name ? 'is-flipped' : ''}`}
                onClick={() => setFlippedCard(flippedCard === platform.name ? null : platform.name)}
              >
                <div className="card-face card-front">
                  <img 
                    src={platform.logo} 
                    alt={platform.name} 
                    className="platform-logo"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null; // Prevent infinite loop
                      img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEwIDIxIDMgMTUiPjwvcG9seWxpbmU+PC9zdmc+';
                    }}
                  />
                  <h3 className="platform-name">{platform.name}</h3>
                </div>
                <div className="card-face card-back">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlippedCard(null);
                    }}
                    className="close-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="platform-description">
                    {t(platform.description)}
                  </p>
                  {platform.qrCode ? (
                    <>
                      <img 
                        src={platform.qrCode} 
                        alt={`${platform.name} QR Code`} 
                        className="qr-code"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.onerror = null;
                          img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEwIDIxIDMgMTUiPjwvcG9seWxpbmU+PC9zdmc+';
                        }}
                      />
                      <p className="scan-text">{t(STRINGS.SCAN_TO_JOIN)}</p>
                    </>
                  ) : platform.link ? (
                    <a 
                      href={platform.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="join-button"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t(STRINGS.JOIN_NOW)}
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunityPage;