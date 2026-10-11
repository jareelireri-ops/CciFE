import React, { useEffect, useRef, useState } from 'react';

// Shared site components, same ones HomeScreen uses (adjust paths if needed)
import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// ─────────────────────────────────────────────────────────────
// GIVING DETAILS: change the numbers here, nowhere else.
// The number shown on screen is always the number that gets copied.
// ─────────────────────────────────────────────────────────────
const TILL_NUMBER = '686774';
const PAYBILL_BUSINESS = '654321';
const PAYBILL_ACCOUNT = 'CHURCH001';

// Church official who can confirm a payment
const HELP_NUMBER = '0722461386';
const HELP_NUMBER_DISPLAY = '0722 461 386';
const HELP_TEL = '+254722461386';

// Copy text, with a fallback for older browsers or non-secure pages
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the fallback */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

// Copy button that shows "Copied" for two seconds
const CopyButton = ({ value, label, solid }) => {
  const [state, setState] = useState('idle'); // 'idle' | 'copied' | 'failed'
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(value);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button
      type="button"
      className={`gv-copy ${solid ? 'solid' : ''} ${state === 'copied' ? 'done' : ''}`}
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
    >
      {state === 'copied' ? 'COPIED' : state === 'failed' ? 'COPY FAILED' : 'COPY'}
    </button>
  );
};

const GivingScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e3e8f0', color: '#0b1b3a', fontFamily: "system-ui, -apple-system, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        /* Silver-blue palette shared with the rest of the site:
           silver #e3e8f0 | panel #edf1f7 | border #c9d3e2
           navy #0b1b3a | slate #3b4a66 | blue #0369a1 | red #b91c1c */

        .gv-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: gvBgLoop 20s ease infinite;
          width: 100%;
        }
        @keyframes gvBgLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gvIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        .gv-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 24px 90px; font-family: 'Montserrat', sans-serif; }

        .gv-hero {
          position: relative; overflow: hidden;
          padding: 26px 30px 24px;
          border-radius: 20px;
          background: linear-gradient(135deg, #0f2a52 0%, #0b1a38 60%, #1a1a3a 100%);
          border: 1px solid rgba(125, 211, 252, 0.25);
          box-shadow: 0 16px 36px -16px rgba(11, 27, 58, 0.5);
          color: #ffffff;
          animation: gvIn 0.5s ease both;
        }
        .gv-hero::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #7dd3fc 0%, #7dd3fc 40%, #e3e8f0 40%, #e3e8f0 70%, #dc2626 70%, #dc2626 100%);
        }
        .gv-hero::after {
          content: '\\2020'; position: absolute; right: 24px; top: 50%; transform: translateY(-50%);
          font-size: 110px; line-height: 1; color: rgba(255, 255, 255, 0.07);
        }
        .gv-title { font-family: 'Crimson Text', serif; font-size: 38px; font-weight: 700; margin: 0; }
        .gv-sub { font-size: 13px; color: #cbd5e1; margin: 4px 0 0; }

        .gv-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 22px; }
        .gv-card {
          background: linear-gradient(145deg, #eef2f8, #e1e8f2);
          border: 1px solid #c9d3e2;
          border-radius: 18px;
          box-shadow: 0 10px 26px -14px rgba(11, 27, 58, 0.45);
          padding: 26px;
          display: flex; flex-direction: column;
          animation: gvIn 0.5s ease both;
        }
        .gv-card:nth-child(2) { animation-delay: 0.08s; }
        .gv-tag {
          align-self: flex-start;
          font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: #ffffff; padding: 5px 12px; border-radius: 999px;
        }
        .gv-card-title { font-family: 'Crimson Text', serif; font-size: 25px; font-weight: 700; margin: 14px 0 4px; line-height: 1.2; }
        .gv-method { font-size: 13px; color: #3b4a66; margin: 0; }
        .gv-divider { height: 1px; background: #c9d3e2; margin: 18px 0; border: 0; }
        .gv-label { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #3b4a66; margin: 0 0 6px; }
        .gv-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .gv-row + .gv-label { margin-top: 16px; }
        .gv-num { font-family: 'Crimson Text', serif; font-size: 48px; font-weight: 700; line-height: 1; color: #0b1b3a; word-break: break-all; }
        .gv-num.small { font-size: 34px; }
        .gv-hint { font-size: 12px; line-height: 1.5; color: #3b4a66; margin: auto 0 0; padding-top: 18px; }

        .gv-copy {
          min-width: 96px; height: 44px; padding: 0 18px;
          border: 2px solid #0b1b3a; border-radius: 10px;
          background: transparent; color: #0b1b3a;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.8px;
          cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .gv-copy:hover { background: rgba(11, 27, 58, 0.07); }
        .gv-copy.solid { background: #0b1b3a; color: #ffffff; }
        .gv-copy.solid:hover { background: #0369a1; border-color: #0369a1; }
        .gv-copy.done, .gv-copy.solid.done { background: #1e6b3a; border-color: #1e6b3a; color: #ffffff; }
        .gv-copy:focus-visible { outline: 3px solid #dc2626; outline-offset: 3px; }

        .gv-thanks { text-align: center; margin-top: 30px; animation: gvIn 0.5s ease 0.16s both; }
        .gv-thanks p { font-family: 'Crimson Text', serif; font-size: 24px; font-weight: 700; margin: 0; }
        .gv-thanks small { display: block; margin-top: 4px; font-size: 12px; color: #3b4a66; }

        .gv-help {
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;
          margin-top: 28px; padding: 22px 28px;
          border-radius: 18px;
          background: linear-gradient(135deg, #0f2a52 0%, #0b1a38 100%);
          border: 1px solid rgba(125, 211, 252, 0.25);
          box-shadow: 0 16px 36px -16px rgba(11, 27, 58, 0.5);
          color: #ffffff;
          animation: gvIn 0.5s ease 0.24s both;
        }
        .gv-help::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #7dd3fc 0%, #7dd3fc 40%, #e3e8f0 40%, #e3e8f0 70%, #dc2626 70%, #dc2626 100%);
        }
        .gv-help-text { flex: 1; min-width: 240px; }
        .gv-help-title { font-family: 'Crimson Text', serif; font-size: 24px; font-weight: 700; margin: 0 0 4px; }
        .gv-help-desc { font-size: 13px; line-height: 1.6; color: #cbd5e1; margin: 0; }
        .gv-help-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .gv-help-num { font-family: 'Crimson Text', serif; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; margin-right: 6px; }
        .gv-call {
          display: inline-flex; align-items: center; justify-content: center;
          height: 46px; padding: 0 22px; border-radius: 12px;
          background: #dc2626; color: #ffffff; text-decoration: none;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
          transition: background 0.2s;
        }
        .gv-call:hover { background: #b91c1c; }
        .gv-call:focus-visible { outline: 3px solid #7dd3fc; outline-offset: 3px; }
        .gv-help .gv-copy { border-color: #7f93b3; color: #ffffff; }
        .gv-help .gv-copy:hover { background: rgba(255, 255, 255, 0.1); }
        .gv-help .gv-copy.done { background: #1e6b3a; border-color: #1e6b3a; }
        .gv-help .gv-copy:focus-visible { outline: 3px solid #7dd3fc; }

        @media (max-width: 760px) {
          .gv-cards { grid-template-columns: 1fr; }
          .gv-title { font-size: 32px; }
          .gv-num { font-size: 42px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gv-bg, .gv-hero, .gv-card, .gv-thanks, .gv-help { animation: none; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }, { label: 'Giving', path: '/giving' }]} />
      </div>

      <div className="gv-bg">
        <div className="gv-wrap">

          <div className="gv-hero">
            <h1 className="gv-title">Giving and Tithes</h1>
            <p className="gv-sub">Choose what you are giving towards, then pay with M-Pesa</p>
          </div>

          <div className="gv-cards">

            {/* TITHES, OFFERINGS, THANKSGIVING: Buy Goods Till */}
            <section className="gv-card" aria-labelledby="gv-tithes">
              <span className="gv-tag" style={{ background: '#0369a1' }}>Tithes and offerings</span>
              <h2 className="gv-card-title" id="gv-tithes">Tithes, offerings and thanksgiving</h2>
              <p className="gv-method">M-Pesa &middot; Buy Goods</p>
              <hr className="gv-divider" />
              <p className="gv-label">Till number</p>
              <div className="gv-row">
                <span className="gv-num">{TILL_NUMBER}</span>
                <CopyButton value={TILL_NUMBER} label="Till number" solid />
              </div>
              <p className="gv-hint">Open M-Pesa, choose Lipa na M-Pesa, then Buy Goods and Services.</p>
            </section>

            {/* PLEDGES AND PROJECTS: Paybill */}
            <section className="gv-card" aria-labelledby="gv-pledges">
              <span className="gv-tag" style={{ background: '#b91c1c' }}>Pledges and projects</span>
              <h2 className="gv-card-title" id="gv-pledges">Pledges and donations to church projects</h2>
              <p className="gv-method">M-Pesa &middot; Paybill</p>
              <hr className="gv-divider" />
              <p className="gv-label">Business number</p>
              <div className="gv-row">
                <span className="gv-num small">{PAYBILL_BUSINESS}</span>
                <CopyButton value={PAYBILL_BUSINESS} label="Business number" />
              </div>
              <p className="gv-label">Account number</p>
              <div className="gv-row">
                <span className="gv-num small">{PAYBILL_ACCOUNT}</span>
                <CopyButton value={PAYBILL_ACCOUNT} label="Account number" />
              </div>
            </section>

          </div>

          <div className="gv-thanks">
            <p>Thank you for your generous giving. Be blessed.</p>
            <small>2 Corinthians 9:7</small>
          </div>

          {/* HELP / CONFIRMATION BANNER */}
          <aside className="gv-help" aria-labelledby="gv-help-title">
            <div className="gv-help-text">
              <h2 className="gv-help-title" id="gv-help-title">Need help or confirmation?</h2>
              <p className="gv-help-desc">
                Had trouble paying, or want to confirm that your payment went through? Call a church official.
              </p>
            </div>
            <div className="gv-help-actions">
              <span className="gv-help-num">{HELP_NUMBER_DISPLAY}</span>
              <a className="gv-call" href={`tel:${HELP_TEL}`}>Call now</a>
              <CopyButton value={HELP_NUMBER} label="official's phone number" />
            </div>
          </aside>

        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
    </div>
  );
};

export default GivingScreen;