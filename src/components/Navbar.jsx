import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, X, Heart, UsersThree, HandsPraying } from '@phosphor-icons/react';
import CCILogo from '../assets/images/cci-logo.png';

/* ---- Pages (highlighted when you are on them) ---- */
const PAGE_LINKS = [
  { label: 'Home',    path: '/' },
  { label: 'Notices', path: '/notices' },   // change if your route is different
  { label: 'Events',  path: '/events' },
];

/* ---- Links that scroll to the footer ----
   If your Footer has elements with these ids, the page scrolls to them.
   If not, it simply scrolls to the footer, or to the bottom of the page. */
const FOOTER_LINKS = [
  { label: 'About',   target: 'footer-about' },
  { label: 'Contact', target: 'footer-contact' },
];

const SESSION_KEY = 'cci_member_session';

const hasSession = () => {
  try { return !!localStorage.getItem(SESSION_KEY); } catch (e) { return false; }
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const signedIn = hasSession();
  const groupLabel = signedIn ? 'My groups' : 'Join a group';
  const groupPath = signedIn ? '/my-groups' : '/members-connect';

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  const scrollToFooter = (targetId) => {
    setOpen(false);
    // wait one tick so the drawer closes first
    setTimeout(() => {
      const el =
        document.getElementById(targetId) ||
        document.getElementById('footer') ||
        document.querySelector('footer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }
    }, 60);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,600;1,400&family=Montserrat:wght@500;700;900&display=swap');

        body, html { margin: 0; padding: 0; width: 100%; overflow-x: hidden; }

        .cci-header {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          box-shadow: 0 6px 22px -12px rgba(11, 27, 58, 0.45);
        }

        /* ---------- Top strip ---------- */
        .cci-strip {
          height: 34px;
          background: #0b1b3a;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(12px, 4vw, 32px);
          box-sizing: border-box;
        }
        .cci-strip__left { display: flex; align-items: center; gap: 22px; }
        .cci-strip button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 12px;
          color: #e3e8f0;
          transition: color 0.2s;
        }
        .cci-strip button svg { color: #7dd3fc; }
        .cci-strip button:hover { color: #ffffff; }
        .cci-strip__give { color: #fca5a5 !important; }
        .cci-strip__give svg { color: #f87171 !important; }

        /* ---------- Main bar ---------- */
        .cci-navbar {
          position: relative;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
          background: linear-gradient(180deg, #eef2f8, #e3e9f2);
          border-bottom: 1px solid #c0cad9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(12px, 4vw, 32px);
          height: clamp(58px, 10vw, 72px);
        }

        /* the subtle shimmer: a soft band of light sweeps across, then rests */
        .cci-navbar::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 100%;
          background: linear-gradient(105deg,
            rgba(255,255,255,0) 38%,
            rgba(255,255,255,0.6) 50%,
            rgba(255,255,255,0) 62%);
          transform: translateX(-100%);
          animation: cciShimmer 7s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes cciShimmer {
          0%   { transform: translateX(-100%); }
          35%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        .cci-navbar__left {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: clamp(8px, 2vw, 14px);
          cursor: pointer;
          flex-shrink: 0;
        }
        .cci-navbar__logo {
          width: clamp(40px, 9vw, 54px);
          height: clamp(40px, 9vw, 54px);
          object-fit: contain;
        }
        .cci-navbar__name-block { display: flex; flex-direction: column; line-height: 1.15; }
        .cci-navbar__name {
          font-family: 'Montserrat', sans-serif;
          font-weight: 900;
          font-size: clamp(10px, 2.2vw, 13px);
          color: #0369a1;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .cci-navbar__tagline {
          font-family: 'Crimson Text', serif;
          font-style: italic;
          font-size: clamp(12px, 2.5vw, 16px);
          color: #0b1b3a;
        }

        .cci-navbar__links {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: stretch;
          gap: clamp(16px, 2.6vw, 28px);
          list-style: none;
          margin: 0;
          padding: 0;
          height: 100%;
        }
        .cci-navbar__links li { display: flex; align-items: stretch; }
        .cci-navbar__link {
          position: relative;
          z-index: 0;
          display: flex;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(11px, 1.8vw, 13px);
          color: #1d2b4a;
          letter-spacing: 0.3px;
          white-space: nowrap;
          padding: 0;
          transition: color 0.2s;
        }
        .cci-navbar__link:hover { color: #0369a1; }
        /* soft pool of light behind the active word */
        .cci-navbar__link::before {
          content: '';
          position: absolute;
          left: -14px; right: -14px;
          top: 50%;
          height: 44px;
          transform: translateY(-50%) scale(0.7);
          background: radial-gradient(ellipse at center, rgba(125,211,252,0.55), rgba(125,211,252,0) 70%);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
          z-index: -1;
        }
        /* small cross that rises above the active word */
        .cci-navbar__link::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 6px;
          width: 10px;
          height: 14px;
          margin-left: -5px;
          background:
            linear-gradient(#0369a1, #0369a1) center / 2px 100% no-repeat,
            linear-gradient(#0369a1, #0369a1) center 4px / 100% 2px no-repeat;
          filter: drop-shadow(0 0 4px rgba(125,211,252,0.9));
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .cci-navbar__link.active { color: #0369a1; }
        .cci-navbar__link.active::before { opacity: 1; transform: translateY(-50%) scale(1); }
        .cci-navbar__link.active::after { opacity: 1; transform: translateY(0); }

        .cci-navbar__hamburger {
          position: relative;
          z-index: 1;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #0b1b3a;
          display: none;
        }

        /* ---------- Tricolor line ---------- */
        .cci-tricolor {
          height: 5px;
          background: linear-gradient(90deg, #7dd3fc 40%, #ffffff 40% 70%, #b91c1c 70%);
        }

        /* ---------- Mobile drawer ---------- */
        .cci-navbar__drawer {
          position: fixed;
          top: 0; right: 0;
          width: min(290px, 82vw);
          height: 100vh;
          background: #eef2f8;
          border-left: 1px solid #c0cad9;
          z-index: 200;
          display: flex;
          flex-direction: column;
          padding: clamp(20px, 5vw, 28px);
          gap: 22px;
          box-sizing: border-box;
          transform: translateX(100%);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cci-navbar__drawer.open { transform: translateX(0); }
        .cci-navbar__drawer-close {
          align-self: flex-end;
          background: none;
          border: none;
          color: #0b1b3a;
          cursor: pointer;
        }
        .cci-navbar__drawer-links {
          display: flex;
          flex-direction: column;
          gap: 18px;
          list-style: none;
          padding: 0; margin: 0;
        }
        .cci-navbar__drawer-links button {
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(15px, 4vw, 18px);
          color: #1d2b4a;
        }
        .cci-navbar__drawer-links button.active { color: #0369a1; }
        .cci-navbar__drawer-divider { height: 1px; background: #c0cad9; border: none; margin: 0; }
        .cci-navbar__drawer-actions { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }
        .cci-drawer-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .cci-drawer-btn--ghost { background: transparent; border: 2px solid #0b1b3a; color: #0b1b3a; }
        .cci-drawer-btn--give { background: #b91c1c; border: 2px solid #b91c1c; color: #fff; }

        .cci-navbar__overlay {
          position: fixed;
          inset: 0;
          background: rgba(11, 27, 58, 0.35);
          backdrop-filter: blur(3px);
          z-index: 199;
          display: none;
        }
        .cci-navbar__overlay.open { display: block; }

        @media (max-width: 760px) {
          .cci-strip { display: none; }
          .cci-navbar__links { display: none; }
          .cci-navbar__hamburger { display: flex; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cci-navbar::after { animation: none; opacity: 0; }
          .cci-navbar__link::before,
          .cci-navbar__link::after,
          .cci-navbar__drawer { transition: none; }
        }
      `}</style>

      <header className="cci-header">
        {/* Top strip: the things people DO */}
        <div className="cci-strip">
          <div className="cci-strip__left">
            <button type="button" onClick={() => goTo('/prayers')}>
              <HandsPraying size={15} weight="bold" /> Prayer request
            </button>
            <button type="button" onClick={() => goTo(groupPath)}>
              <UsersThree size={15} weight="bold" /> {groupLabel}
            </button>
          </div>
          <button type="button" className="cci-strip__give" onClick={() => goTo('/giving')}>
            <Heart size={15} weight="fill" /> Give with M-Pesa
          </button>
        </div>

        {/* Main bar: the pages people READ */}
        <nav className="cci-navbar">
          <div className="cci-navbar__left" onClick={() => goTo('/')}>
            <img src={CCILogo} alt="CCI Logo" className="cci-navbar__logo" />
            <div className="cci-navbar__name-block">
              <span className="cci-navbar__name">Christian Church International</span>
              <span className="cci-navbar__tagline">Light-Sanctuary</span>
            </div>
          </div>

          <ul className="cci-navbar__links">
            {PAGE_LINKS.map((link) => (
              <li key={link.path}>
                <button
                  type="button"
                  className={'cci-navbar__link' + (location.pathname === link.path ? ' active' : '')}
                  onClick={() => goTo(link.path)}
                >
                  {link.label}
                </button>
              </li>
            ))}
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  className="cci-navbar__link"
                  onClick={() => scrollToFooter(link.target)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="cci-navbar__hamburger"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <List size={28} weight="bold" />
          </button>
        </nav>

        <div className="cci-tricolor" />
      </header>

      {/* Mobile drawer */}
      <div className={'cci-navbar__overlay' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
      <div className={'cci-navbar__drawer' + (open ? ' open' : '')}>
        <button
          type="button"
          className="cci-navbar__drawer-close"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <X size={26} weight="bold" />
        </button>

        <ul className="cci-navbar__drawer-links">
          {PAGE_LINKS.map((link) => (
            <li key={link.path}>
              <button
                type="button"
                className={location.pathname === link.path ? 'active' : ''}
                onClick={() => goTo(link.path)}
              >
                {link.label}
              </button>
            </li>
          ))}
          {FOOTER_LINKS.map((link) => (
            <li key={link.label}>
              <button type="button" onClick={() => scrollToFooter(link.target)}>
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <hr className="cci-navbar__drawer-divider" />

        <ul className="cci-navbar__drawer-links">
          <li>
            <button type="button" onClick={() => goTo('/prayers')}>Prayer request</button>
          </li>
        </ul>

        <div className="cci-navbar__drawer-actions">
          <button type="button" className="cci-drawer-btn cci-drawer-btn--ghost" onClick={() => goTo(groupPath)}>
            <UsersThree size={18} weight="bold" /> {groupLabel}
          </button>
          <button type="button" className="cci-drawer-btn cci-drawer-btn--give" onClick={() => goTo('/giving')}>
            <Heart size={18} weight="fill" /> Give
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;