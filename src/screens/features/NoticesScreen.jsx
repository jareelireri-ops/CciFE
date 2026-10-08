import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MegaphoneSimple, UsersThree, CalendarBlank, HandsPraying, Sparkle } from '@phosphor-icons/react';

// Shared site components, same ones HomeScreen uses (adjust paths if needed)
import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// ── HELPERS ──
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);

const timeAgo = (date) => {
  const days = Math.floor((Date.now() - date.getTime()) / DAY);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
};

// Replace with your real data (each notice needs a real date).
const ALL_NOTICES = [
  { id: 1, icon: MegaphoneSimple, title: 'CCI Website Coming Soon!', text: 'Our brand-new digital home is almost ready. Track announcements, notices, and stay updated seamlessly.', date: daysAgo(3) },
  { id: 2, icon: UsersThree, title: 'Covenant Fellowship Night', text: 'Support the organization and growth of our community fellowships and holy celebrations.', date: daysAgo(5) },
  { id: 3, icon: UsersThree, title: 'Volunteers Needed', text: 'Join our welcoming and ushering ministries for upcoming services.', date: daysAgo(7) },
  { id: 4, icon: CalendarBlank, title: 'Youth Group Meeting', text: 'Friday youth gathering in the main sanctuary hall.', date: daysAgo(14) },
  { id: 5, icon: HandsPraying, title: 'Prayer And meeting', text: 'Mid-week intercessory prayer and breaking of bread.', date: daysAgo(15) },
  { id: 6, icon: MegaphoneSimple, title: 'Prayer Announcements', text: 'Important updates regarding congregation prayer networks.', date: daysAgo(21) },
  { id: 7, icon: HandsPraying, title: 'Prayer Group Meeting', text: 'Weekly cell group covenant fellowship assemblies.', date: daysAgo(28) },
  { id: 8, icon: Sparkle, title: 'Media Tech', text: 'Sound system, stream operations, and production training workshops.', date: daysAgo(29) },
];

// Accents cycle through blue, red and silver
const ACCENTS = ['blue', 'red', 'silver'];

// ── SCREEN ──
const NoticesScreen = () => {
  const navigate = useNavigate();

  // Always start at the top when this page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Only notices from the past 30 days, newest first
  const notices = ALL_NOTICES
    .filter((n) => Date.now() - n.date.getTime() <= 30 * DAY)
    .sort((a, b) => b.date - a.date);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e3e8f0', color: '#0b1b3a', fontFamily: "system-ui, -apple-system, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        /* Same silver-blue palette as the Home page:
           silver #e3e8f0 | card #edf1f7 | border #c9d3e2
           ink navy #0b1b3a | slate #3b4a66 | blue #0369a1 | red #dc2626 */

        .notices-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: noticesBgLoop 20s ease infinite;
          width: 100%;
        }
        @keyframes noticesBgLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .notices-main-container { max-width: 780px; margin: 0 auto; padding: 36px 24px 90px; }

        /* Navy hero banner for contrast, with the blue / white / red strip */
        .notices-hero {
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 18px;
          padding: 28px 28px 26px;
          margin-bottom: 28px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0f2a52 0%, #0b1a38 60%, #1a1a3a 100%);
          border: 1px solid rgba(125,211,252,0.25);
          box-shadow: 0 16px 36px -16px rgba(11,27,58,0.5);
        }
        .notices-hero::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #7dd3fc 0%, #7dd3fc 40%, #e3e8f0 40%, #e3e8f0 70%, #dc2626 70%, #dc2626 100%);
        }
        .notices-hero::after {
          content: '\\2020'; position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
          font-size: 110px; line-height: 1; color: rgba(255,255,255,0.07);
        }
        .action-back-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.2s; }
        .action-back-btn:hover { background: rgba(125,211,252,0.28); }
        .action-back-btn:focus-visible { outline: 3px solid #dc2626; outline-offset: 3px; }
        .notices-title { font-family: 'Crimson Text', serif; font-size: 32px; font-weight: 700; margin: 0; color: #ffffff; }
        .notices-subtitle { font-family: 'Montserrat', sans-serif; font-size: 13px; color: #cbd5e1; margin: 4px 0 0; }
        .notices-count { margin-left: auto; z-index: 1; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.22); border-radius: 999px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 600; padding: 6px 14px; white-space: nowrap; }

        .notices-list { display: flex; flex-direction: column; gap: 16px; }
        .notice-card {
          --accent: #0369a1;
          position: relative; display: flex; gap: 18px; align-items: flex-start;
          background: linear-gradient(145deg, #eef2f8, #e1e8f2);
          border: 1px solid #c9d3e2;
          border-left: 4px solid var(--accent);
          border-radius: 16px; padding: 20px 24px;
          box-shadow: 0 6px 18px -10px rgba(11,27,58,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: noticeIn 0.5s ease both;
        }
        .notice-card.accent-red { --accent: #dc2626; }
        .notice-card.accent-silver { --accent: #64748b; }
        .notice-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -14px rgba(11,27,58,0.5); }
        .notice-icon {
          flex-shrink: 0; width: 46px; height: 46px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .notice-body { flex: 1; min-width: 0; }
        .notice-meta { display: inline-block; font-family: 'Montserrat', sans-serif; font-size: 11px; font-weight: 700; color: #3b4a66; background: rgba(11,27,58,0.07); border-radius: 999px; padding: 3px 10px; margin-bottom: 8px; }
        .notice-title { font-family: 'Montserrat', sans-serif; font-size: 17px; font-weight: 700; margin: 0 0 6px; color: #0b1b3a; }
        .notice-text { font-family: 'Montserrat', sans-serif; font-size: 14px; line-height: 1.6; color: #3b4a66; margin: 0; }
        .notices-empty { text-align: center; padding: 60px 0; color: #3b4a66; font-size: 14px; }

        @keyframes noticeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .notice-card { animation: none; transition: none; }
          .notices-bg { animation: none; }
        }
        @media (max-width: 600px) {
          .notices-hero { flex-wrap: wrap; }
          .notices-count { margin-left: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }, { label: 'Announcements', path: '/notices' }]} />
      </div>

      <div className="notices-bg">
        <main className="notices-main-container">
          <div className="notices-hero">
            <button className="action-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
              <ArrowLeft size={18} weight="bold" />
            </button>
            <div>
              <h2 className="notices-title">Announcements</h2>
              <p className="notices-subtitle">From the past month</p>
            </div>
            <span className="notices-count">{notices.length} {notices.length === 1 ? 'notice' : 'notices'}</span>
          </div>

          {notices.length === 0 ? (
            <div className="notices-empty">No announcements in the past month.</div>
          ) : (
            <div className="notices-list">
              {notices.map((n, i) => {
                const Icon = n.icon || MegaphoneSimple;
                return (
                  <article
                    key={n.id}
                    className={`notice-card accent-${ACCENTS[i % ACCENTS.length]}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="notice-icon"><Icon size={22} weight="duotone" /></div>
                    <div className="notice-body">
                      <span className="notice-meta">{timeAgo(n.date)}</span>
                      <h3 className="notice-title">{n.title}</h3>
                      <p className="notice-text">{n.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
    </div>
  );
};

export default NoticesScreen;