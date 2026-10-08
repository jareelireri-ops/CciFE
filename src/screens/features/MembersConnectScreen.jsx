import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Shared site components, same ones HomeScreen uses (adjust paths if needed)
import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────
// DEMO = true lets you try the whole flow without a backend.
// The verification code is 1234 and data is kept in this browser only.
// Set DEMO = false once your server has the endpoints listed below.
const DEMO = true;
const API_BASE = 'http://localhost:5000/api';
const MY_GROUPS_PATH = '/my-groups';
const SESSION_KEY = 'cci_member_session';
const PENDING_KEY = 'cci_member_pending';
const DEMO_CODE = '1234';

// Endpoints expected when DEMO = false:
//   GET  /groups                    -> [{ id, name }]
//   POST /members/join              { name, phone, groups }  -> sends the code
//   POST /auth/verify               { phone, code } -> { token, name, phone, groups }
//   PUT  /me/groups                 { groups }  (Authorization: Bearer token) -> { groups }
//   POST /groups/suggest            { name }

const DEMO_GROUPS = [
  { id: 'praise-worship', name: 'Praise and Worship' },
  { id: 'men', name: 'Men' },
  { id: 'women', name: 'Women' },
  { id: 'media-team', name: 'Media Team' },
  { id: 'junior-youth', name: 'Junior Youth' },
  { id: 'senior-youth', name: 'Senior Youth' },
  { id: 'sunday-school', name: 'Sunday School' },
];

// ─────────────────────────────────────────────────────────────
// SMALL HELPERS
// ─────────────────────────────────────────────────────────────
const readStore = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const writeStore = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable, ignore */
  }
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
};

// 0712345678 -> 07•• ••• 678
const maskPhone = (phone) => {
  const d = phone.replace(/\D/g, '');
  if (d.length < 6) return phone;
  return `${d.slice(0, 2)}\u2022\u2022 \u2022\u2022\u2022 ${d.slice(-3)}`;
};

const initialsOf = (name) => {
  const words = name.split(' ').filter((w) => w.toLowerCase() !== 'and');
  return words.length > 1
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name[0].toUpperCase();
};

// ─────────────────────────────────────────────────────────────
// API LAYER (the only place that talks to the server)
// ─────────────────────────────────────────────────────────────
const api = {
  async getGroups() {
    if (DEMO) return DEMO_GROUPS;
    const res = await fetch(`${API_BASE}/groups`);
    if (!res.ok) throw new Error('Could not load groups.');
    return res.json();
  },

  async requestCode({ name, phone, groups }) {
    if (DEMO) {
      await wait(500);
      writeStore(PENDING_KEY, { name, phone, groups });
      return;
    }
    const res = await fetch(`${API_BASE}/members/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, groups }),
    });
    if (!res.ok) throw new Error('We could not send the code. Please try again.');
  },

  async verifyCode({ phone, code }) {
    if (DEMO) {
      await wait(400);
      if (code !== DEMO_CODE) throw new Error('That code is not right. Please try again.');
      const pending = readStore(PENDING_KEY) || { name: 'Member', phone, groups: [] };
      return { token: 'demo-token', ...pending };
    }
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) throw new Error('That code is not right. Please try again.');
    return res.json();
  },

  async saveGroups(token, groups) {
    if (DEMO) {
      await wait(400);
      return { groups };
    }
    const res = await fetch(`${API_BASE}/me/groups`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groups }),
    });
    if (!res.ok) throw new Error('We could not save your changes. Please try again.');
    return res.json();
  },

  async suggestGroup(name) {
    if (DEMO) {
      await wait(400);
      return;
    }
    const res = await fetch(`${API_BASE}/groups/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('We could not send your suggestion. Please try again.');
  },
};

// ─────────────────────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────────────────────
const MembersConnectScreen = () => {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [mode, setMode] = useState('loading'); // 'loading' | 'new' | 'manage' | 'verify'
  const [session, setSession] = useState(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [picked, setPicked] = useState([]); // selected group ids
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [digits, setDigits] = useState(['', '', '', '']);
  const [resendIn, setResendIn] = useState(0);
  const codeRefs = useRef([]);

  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // Load groups and decide which view to show
  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      let list = [];
      try {
        list = await api.getGroups();
      } catch (err) {
        if (active) setMessage({ type: 'error', text: err.message });
      }
      if (!active) return;
      setGroups(list);

      const saved = readStore(SESSION_KEY);
      if (saved && saved.token) {
        setSession(saved);
        setPicked(saved.groups || []);
        setMode('manage');
      } else {
        setMode('new');
      }
    })();
    return () => { active = false; };
  }, []);

  // Countdown for "Resend code"
  useEffect(() => {
    if (mode !== 'verify' || resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, resendIn]);

  const baseline = session ? session.groups || [] : [];
  const toAdd = picked.filter((id) => !baseline.includes(id));
  const toRemove = baseline.filter((id) => !picked.includes(id));
  const changeCount = toAdd.length + toRemove.length;

  const groupName = (id) => (groups.find((g) => g.id === id) || { name: id }).name;

  const togglePick = (id) => {
    setMessage({ type: '', text: '' });
    setErrors((e) => ({ ...e, groups: '' }));
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  // ── NEW VISITOR: validate, then ask for the code ──
  const handleSignUp = async (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Please enter your name.';
    if (!isValidPhone(phone)) next.phone = 'Please enter a valid phone number.';
    if (picked.length === 0) next.groups = 'Choose at least one group.';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      setBusy(true);
      setMessage({ type: '', text: '' });
      await api.requestCode({ name: name.trim(), phone: phone.trim(), groups: picked });
      setDigits(['', '', '', '']);
      setResendIn(30);
      setMode('verify');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // ── VERIFY: check the code, start the session ──
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = digits.join('');
    if (code.length < 4) {
      setMessage({ type: 'error', text: 'Please enter all 4 digits.' });
      return;
    }
    try {
      setBusy(true);
      setMessage({ type: '', text: '' });
      const result = await api.verifyCode({ phone: phone.trim(), code });
      const next = {
        token: result.token,
        name: result.name || name.trim(),
        phone: result.phone || phone.trim(),
        groups: result.groups || picked,
      };
      writeStore(SESSION_KEY, next);
      writeStore(PENDING_KEY, null);
      navigate(MY_GROUPS_PATH);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const setDigit = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    setDigits((d) => d.map((v, i) => (i === index ? clean : v)));
    if (clean && index < 3) codeRefs.current[index + 1]?.focus();
  };

  const handleDigitKey = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    setDigits(pasted.padEnd(4, ' ').split('').map((c) => (c === ' ' ? '' : c)));
    codeRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const resendCode = async () => {
    try {
      setBusy(true);
      await api.requestCode({ name: name.trim(), phone: phone.trim(), groups: picked });
      setResendIn(30);
      setMessage({ type: 'ok', text: 'A new code has been sent.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // ── RETURNING MEMBER: save join / leave changes in one go ──
  const handleSaveChanges = async () => {
    if (picked.length === 0) {
      setMessage({ type: 'error', text: 'Stay in at least one group, or sign out to leave them all.' });
      return;
    }
    try {
      setBusy(true);
      setMessage({ type: '', text: '' });
      const result = await api.saveGroups(session.token, picked);
      const next = { ...session, groups: result.groups || picked };
      writeStore(SESSION_KEY, next);
      setSession(next);
      navigate(MY_GROUPS_PATH);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    writeStore(SESSION_KEY, null);
    setSession(null);
    setPicked([]);
    setName('');
    setPhone('');
    setMessage({ type: '', text: '' });
    setMode('new');
  };

  // ── SUGGEST A NEW GROUP ──
  const handleSuggest = async (e) => {
    e.preventDefault();
    if (suggestion.trim().length < 3) {
      setMessage({ type: 'error', text: 'Please type the group name you would like to suggest.' });
      return;
    }
    try {
      setBusy(true);
      await api.suggestGroup(suggestion.trim());
      setSuggestion('');
      setShowSuggest(false);
      setMessage({ type: 'ok', text: 'Thank you. The church admins will review your suggestion.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  // Tile status text and style
  const tileState = (id) => {
    if (mode === 'manage') {
      const was = baseline.includes(id);
      const now = picked.includes(id);
      if (was && now) return { cls: 'on', label: 'Joined', mark: '\u2713' };
      if (was && !now) return { cls: 'lv', label: 'Will leave', mark: '\u2212' };
      if (!was && now) return { cls: 'jn', label: 'Will join', mark: '+' };
      return { cls: '', label: 'Tap to join', mark: '' };
    }
    return picked.includes(id)
      ? { cls: 'on', label: 'Selected', mark: '\u2713' }
      : { cls: '', label: 'Tap to join', mark: '' };
  };

  const changeSummary = [
    ...toAdd.map((id) => `Join ${groupName(id)}`),
    ...toRemove.map((id) => `Leave ${groupName(id)}`),
  ].join(' \u00B7 ');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e3e8f0', color: '#0b1b3a', fontFamily: "system-ui, -apple-system, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        /* Silver-blue palette shared with the rest of the site:
           silver #e3e8f0 | panel #edf1f7 | field #f1f4f9 | border #b4c1d6
           navy #0b1b3a | slate #3b4a66 | blue #0369a1 | red #dc2626 */

        .mc-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: mcBgLoop 20s ease infinite;
          width: 100%;
        }
        @keyframes mcBgLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes mcIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        .mc-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 24px 40px; font-family: 'Montserrat', sans-serif; animation: mcIn 0.5s ease both; }
        .mc-title { font-family: 'Crimson Text', serif; font-size: 38px; font-weight: 700; margin: 0 0 6px; }
        .mc-sub { font-size: 13px; line-height: 1.6; color: #3b4a66; margin: 0; max-width: 640px; }

        .mc-panel {
          background: linear-gradient(145deg, #eef2f8, #e1e8f2);
          border: 1px solid #c9d3e2;
          border-radius: 18px;
          box-shadow: 0 10px 26px -14px rgba(11, 27, 58, 0.45);
        }

        .mc-step { display: flex; align-items: center; gap: 10px; font-family: 'Crimson Text', serif; font-size: 22px; font-weight: 700; margin: 24px 0 12px; }
        .mc-step em {
          font-family: 'Montserrat', sans-serif; font-style: normal; font-size: 12px; font-weight: 700;
          width: 26px; height: 26px; border-radius: 50%;
          background: #0b1b3a; color: #ffffff;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mc-step small { font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 500; color: #3b4a66; }

        /* Identity fields */
        .mc-id { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 18px 22px; }
        .mc-label { display: block; font-size: 12px; font-weight: 700; color: #3b4a66; margin-bottom: 5px; }
        .mc-req { color: #b91c1c; font-style: normal; }
        .mc-input {
          width: 100%; height: 46px; box-sizing: border-box;
          border: 1px solid #b4c1d6; border-radius: 10px;
          background: #f1f4f9; padding: 0 14px;
          font-family: 'Montserrat', sans-serif; font-size: 14px; color: #0b1b3a;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .mc-input::placeholder { color: #6b7a94; }
        .mc-input:focus { border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.18); }
        .mc-input.has-error { border: 2px solid #dc2626; }
        .mc-error { font-size: 12px; font-weight: 700; color: #b91c1c; margin: 5px 0 0; }

        /* Returning member chip */
        .mc-chip { display: flex; align-items: center; gap: 14px; padding: 14px 18px; margin: 18px 0 0; }
        .mc-chip-avatar { width: 44px; height: 44px; border-radius: 50%; background: #0b1b3a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .mc-chip-text { flex: 1; min-width: 0; }
        .mc-chip-text b { font-size: 15px; display: block; }
        .mc-chip-text span { font-size: 12px; color: #3b4a66; }
        .mc-ghost {
          height: 42px; padding: 0 16px; border-radius: 10px;
          border: 1px solid #7f93b3; background: transparent; color: #0b1b3a;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; cursor: pointer;
        }
        .mc-ghost:hover { background: rgba(11, 27, 58, 0.07); }

        /* Group tiles */
        .mc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .mc-tile {
          display: flex; flex-direction: column; justify-content: space-between; gap: 6px;
          height: 104px; padding: 12px 14px; box-sizing: border-box;
          border-radius: 16px; border: 2px solid #c9d3e2; background: #edf1f7;
          color: #0b1b3a; text-align: left; cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          transition: transform 0.15s, border-color 0.2s, background 0.2s;
        }
        .mc-tile:hover { transform: translateY(-2px); border-color: #7f93b3; }
        .mc-tile:focus-visible { outline: 3px solid #dc2626; outline-offset: 3px; }
        .mc-tile-top { display: flex; justify-content: space-between; align-items: center; }
        .mc-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .mc-av0 { background: #d3e6f5; color: #0b4a73; }
        .mc-av1 { background: #f7d6d6; color: #8f1d1d; }
        .mc-av2 { background: #d5dde8; color: #3b4a66; }
        .mc-check {
          width: 24px; height: 24px; border-radius: 7px; border: 2px solid #0b1b3a; box-sizing: border-box;
          display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #ffffff;
        }
        .mc-tile b { display: block; font-size: 13px; }
        .mc-tile small { font-size: 11px; font-weight: 700; color: #3b4a66; }
        .mc-tile.on { border-color: #0369a1; background: #e4edf7; }
        .mc-tile.on .mc-check { background: #0369a1; border-color: #0369a1; }
        .mc-tile.on small { color: #0369a1; }
        .mc-tile.lv { border: 2px dashed #dc2626; background: #fbe9e9; }
        .mc-tile.lv .mc-check { border-color: #dc2626; color: #dc2626; }
        .mc-tile.lv small { color: #b91c1c; }
        .mc-tile.jn { border: 2px dashed #0369a1; background: #eaf3fb; }
        .mc-tile.jn .mc-check { border-color: #0369a1; color: #0369a1; }
        .mc-tile.jn small { color: #0369a1; }
        .mc-tile.sg { border: 2px dashed #7f93b3; background: transparent; }

        .mc-suggest { display: flex; gap: 10px; padding: 14px 18px; margin-top: 14px; align-items: flex-end; flex-wrap: wrap; }
        .mc-suggest > div { flex: 1; min-width: 200px; }

        .mc-msg { margin: 14px 0 0; padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; }
        .mc-msg.error { background: #fbe9e9; color: #8f1d1d; }
        .mc-msg.ok { background: #e1f1e6; color: #1e5a31; }

        /* Bottom action bar */
        .mc-barwrap { position: sticky; bottom: 16px; z-index: 20; padding: 0 24px 16px; max-width: 1000px; margin: 0 auto; box-sizing: border-box; }
        .mc-bar {
          display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          padding: 12px 20px; border-radius: 14px;
          background: linear-gradient(160deg, #0f2a52, #0b1a38); color: #ffffff;
          box-shadow: 0 16px 34px -14px rgba(11, 27, 58, 0.8);
        }
        .mc-bar-text b { display: block; font-size: 13px; }
        .mc-bar-text small { display: block; font-size: 11px; color: #cbd5e1; margin-top: 2px; }
        .mc-bar-actions { display: flex; gap: 10px; }
        .mc-save {
          height: 44px; padding: 0 24px; border: none; border-radius: 10px;
          background: #dc2626; color: #ffffff;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .mc-save:hover:enabled { background: #b91c1c; }
        .mc-save:disabled { opacity: 0.55; cursor: not-allowed; }
        .mc-bar .mc-ghost { color: #ffffff; border-color: #7f93b3; }
        .mc-bar .mc-ghost:hover { background: rgba(255, 255, 255, 0.1); }
        .mc-save:focus-visible, .mc-ghost:focus-visible { outline: 3px solid #7dd3fc; outline-offset: 3px; }

        /* Verify panel */
        .mc-verify { max-width: 480px; margin: 40px auto 0; padding: 34px 36px; text-align: center; }
        .mc-verify h1 { font-family: 'Crimson Text', serif; font-size: 34px; margin: 0 0 8px; }
        .mc-codes { display: flex; gap: 12px; justify-content: center; margin: 24px 0 18px; }
        .mc-code {
          width: 58px; height: 66px; box-sizing: border-box; text-align: center;
          border: 2px solid #b4c1d6; border-radius: 12px; background: #f1f4f9;
          font-family: 'Crimson Text', serif; font-size: 28px; font-weight: 700; color: #0b1b3a; outline: none;
        }
        .mc-code:focus { border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.18); }
        .mc-verify-btn {
          width: 100%; height: 50px; border: none; border-radius: 12px;
          background: #dc2626; color: #ffffff;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
        }
        .mc-verify-btn:hover:enabled { background: #b91c1c; }
        .mc-verify-btn:disabled { opacity: 0.6; cursor: wait; }
        .mc-links { display: flex; justify-content: space-between; margin-top: 16px; }
        .mc-link { background: none; border: none; padding: 8px 0; min-height: 44px; font-family: 'Montserrat', sans-serif; font-size: 12px; font-weight: 700; color: #0369a1; cursor: pointer; }
        .mc-link:disabled { color: #6b7a94; cursor: default; }
        .mc-note { margin: 22px 0 0; padding-top: 16px; border-top: 1px solid #c9d3e2; font-size: 12px; line-height: 1.5; color: #3b4a66; }
        .mc-demo { margin-top: 12px; font-size: 11px; color: #6b7a94; }

        .mc-loading { text-align: center; padding: 80px 0; color: #3b4a66; font-size: 14px; }

        @media (max-width: 860px) {
          .mc-grid { grid-template-columns: repeat(2, 1fr); }
          .mc-id { grid-template-columns: 1fr; }
          .mc-title { font-size: 32px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mc-bg, .mc-wrap { animation: none; }
          .mc-tile { transition: none; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }, { label: 'Members Connect', path: '/members-connect' }]} />
      </div>

      <div className="mc-bg">
        {mode === 'loading' && <div className="mc-loading" role="status">Loading groups...</div>}

        {/* ── NEW VISITOR (sign up) and RETURNING MEMBER (manage) ── */}
        {(mode === 'new' || mode === 'manage') && (
          <form onSubmit={mode === 'new' ? handleSignUp : (e) => e.preventDefault()} noValidate>
            <div className="mc-wrap">
              <h1 className="mc-title">{mode === 'new' ? 'Join your groups' : 'My groups'}</h1>
              {mode === 'new' && (
                <p className="mc-sub">
                  Two quick steps. Your name and number are required so you can get back to your groups on any phone.
                </p>
              )}

              {mode === 'new' && (
                <>
                  <h2 className="mc-step"><em>1</em>Who are you?</h2>
                  <div className="mc-panel mc-id">
                    <div>
                      <label className="mc-label" htmlFor="mc-name">Your name <i className="mc-req">*</i></label>
                      <input
                        id="mc-name"
                        className={`mc-input ${errors.name ? 'has-error' : ''}`}
                        placeholder="First and last name"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: '' })); }}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && <p className="mc-error" role="alert">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mc-label" htmlFor="mc-phone">Phone number <i className="mc-req">*</i></label>
                      <input
                        id="mc-phone"
                        type="tel"
                        inputMode="tel"
                        className={`mc-input ${errors.phone ? 'has-error' : ''}`}
                        placeholder="07XX XXX XXX"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors((x) => ({ ...x, phone: '' })); }}
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <p className="mc-error" role="alert">{errors.phone}</p>}
                    </div>
                  </div>
                </>
              )}

              {mode === 'manage' && session && (
                <div className="mc-panel mc-chip">
                  <span className="mc-chip-avatar" aria-hidden="true">{(session.name || 'M')[0].toUpperCase()}</span>
                  <div className="mc-chip-text">
                    <b>Welcome back{session.name ? `, ${session.name.split(' ')[0]}` : ''}</b>
                    <span>Signed in on this device &middot; {maskPhone(session.phone || '')}</span>
                  </div>
                  <button type="button" className="mc-ghost" onClick={handleSignOut}>Not you? Sign out</button>
                </div>
              )}

              <h2 className="mc-step">
                <em>{mode === 'new' ? '2' : '\u270E'}</em>
                {mode === 'new' ? 'Pick your groups' : 'Tap a group to join or leave'}
                {mode === 'new' && <small>Choose at least one</small>}
              </h2>
              {errors.groups && <p className="mc-error" role="alert" style={{ marginTop: -4, marginBottom: 10 }}>{errors.groups}</p>}

              <div className="mc-grid">
                {groups.map((g, i) => {
                  const st = tileState(g.id);
                  return (
                    <button
                      type="button"
                      key={g.id}
                      className={`mc-tile ${st.cls}`}
                      aria-pressed={picked.includes(g.id)}
                      onClick={() => togglePick(g.id)}
                    >
                      <span className="mc-tile-top">
                        <span className={`mc-avatar mc-av${i % 3}`} aria-hidden="true">{initialsOf(g.name)}</span>
                        <span className="mc-check" aria-hidden="true">{st.mark}</span>
                      </span>
                      <span>
                        <b>{g.name}</b>
                        <small>{st.label}</small>
                      </span>
                    </button>
                  );
                })}

                <button type="button" className="mc-tile sg" onClick={() => setShowSuggest((s) => !s)} aria-expanded={showSuggest}>
                  <span className="mc-tile-top">
                    <span className="mc-avatar mc-av2" aria-hidden="true">+</span>
                  </span>
                  <span>
                    <b>Suggest a group</b>
                    <small>Admins review it</small>
                  </span>
                </button>
              </div>

              {showSuggest && (
                <div className="mc-panel mc-suggest">
                  <div>
                    <label className="mc-label" htmlFor="mc-suggest">Group you would like us to add</label>
                    <input
                      id="mc-suggest"
                      className="mc-input"
                      placeholder="For example: Ushers"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                    />
                  </div>
                  <button type="button" className="mc-save" onClick={handleSuggest} disabled={busy}>Send</button>
                </div>
              )}

              {message.text && (
                <p className={`mc-msg ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</p>
              )}
            </div>

            {/* Sticky action bar */}
            <div className="mc-barwrap">
              <div className="mc-bar">
                {mode === 'new' ? (
                  <>
                    <div className="mc-bar-text">
                      <b>{picked.length} {picked.length === 1 ? 'group' : 'groups'} selected</b>
                      <small>You can change these any time</small>
                    </div>
                    <div className="mc-bar-actions">
                      <button type="submit" className="mc-save" disabled={busy}>
                        {busy ? 'Sending code...' : 'Save and continue'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mc-bar-text">
                      <b>{changeCount === 0 ? 'No changes yet' : `${changeCount} ${changeCount === 1 ? 'change' : 'changes'} waiting`}</b>
                      <small>{changeCount === 0 ? 'Tap a group to join or leave it' : changeSummary}</small>
                    </div>
                    <div className="mc-bar-actions">
                      {changeCount > 0 && (
                        <button type="button" className="mc-ghost" onClick={() => setPicked(baseline)}>Undo</button>
                      )}
                      {changeCount === 0 ? (
                        <button type="button" className="mc-ghost" onClick={() => navigate(MY_GROUPS_PATH)}>Go to my groups</button>
                      ) : (
                        <button type="button" className="mc-save" onClick={handleSaveChanges} disabled={busy}>
                          {busy ? 'Saving...' : 'Save changes'}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
        )}

        {/* ── VERIFY CODE ── */}
        {mode === 'verify' && (
          <div className="mc-wrap">
            <form className="mc-panel mc-verify" onSubmit={handleVerify} noValidate>
              <h1>Check your phone</h1>
              <p className="mc-sub" style={{ margin: '0 auto' }}>We sent a 4-digit code to {maskPhone(phone)}.</p>

              <div className="mc-codes" onPaste={handleDigitPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    className="mc-code"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={d}
                    aria-label={`Digit ${i + 1}`}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKey(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {message.text && (
                <p className={`mc-msg ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'} style={{ marginTop: 0, marginBottom: 14 }}>
                  {message.text}
                </p>
              )}

              <button type="submit" className="mc-verify-btn" disabled={busy}>
                {busy ? 'Checking...' : 'Verify and save'}
              </button>

              <div className="mc-links">
                <button type="button" className="mc-link" onClick={resendCode} disabled={busy || resendIn > 0}>
                  {resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
                </button>
                <button type="button" className="mc-link" onClick={() => { setMessage({ type: '', text: '' }); setMode('new'); }}>
                  Wrong number? Edit
                </button>
              </div>

              <p className="mc-note">
                You only do this on a new phone or after clearing your browser. On your usual phone you go straight in.
              </p>
              {DEMO && <p className="mc-demo">Demo mode: the code is {DEMO_CODE}.</p>}
            </form>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
    </div>
  );
};

export default MembersConnectScreen;