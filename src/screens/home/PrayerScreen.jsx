import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Shared site components, same ones HomeScreen uses (adjust paths if needed)
import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// Set this to your backend URL that accepts a POST with JSON.
// While it is null the form still works (demo mode) but nothing is stored.
const PRAYER_ENDPOINT = null;

const MAX_MESSAGE = 1000;

// Basic phone check: 9 to 15 digits, allowing + and spaces
const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
};

const sendPrayer = async (payload) => {
  if (!PRAYER_ENDPOINT) return; // demo mode
  const res = await fetch(PRAYER_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Request failed');
};

const PrayersScreen = () => {
  const navigate = useNavigate();

  const [view, setView] = useState('form'); // 'form' | 'thankyou'
  const [mode, setMode] = useState('details'); // 'details' | 'anonymous'
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState(''); // bots fill this, people never see it
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Always start at the top when the page or view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const validate = () => {
    const next = {};
    if (message.trim().length < 5) next.message = 'Please write your prayer request or message.';
    if (mode === 'details') {
      if (!name.trim()) next.name = 'Please enter your name.';
      if (!isValidPhone(phone)) next.phone = 'Please enter a valid phone number.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;

    // Spam trap: pretend it worked, send nothing
    if (honeypot) {
      setView('thankyou');
      return;
    }

    // Anonymous requests carry no identifying fields at all
    const payload = {
      message: message.trim(),
      anonymous: mode === 'anonymous',
      sentAt: new Date().toISOString(),
      ...(mode === 'details' ? { name: name.trim(), phone: phone.trim() } : {}),
    };

    try {
      setSending(true);
      await sendPrayer(payload);
      setView('thankyou');
    } catch {
      setSubmitError('Sorry, we could not send your request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setName('');
    setPhone('');
    setErrors({});
    setSubmitError('');
    setMode('details');
    setView('form');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e3e8f0', color: '#0b1b3a', fontFamily: "system-ui, -apple-system, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        /* Silver-blue palette shared with the rest of the site:
           silver #e3e8f0 | panel #edf1f7 | field #f1f4f9 | border #b4c1d6
           navy #0b1b3a | slate #3b4a66 | blue #0369a1 | red #dc2626 */

        .pr-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: prBgLoop 20s ease infinite;
          width: 100%;
        }
        @keyframes prBgLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes prIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        .pr-wrap { max-width: 700px; margin: 0 auto; padding: 44px 24px 100px; font-family: 'Montserrat', sans-serif; animation: prIn 0.5s ease both; }

        .pr-top { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
        .pr-cross { color: #dc2626; font-size: 30px; line-height: 1; }
        .pr-title { font-family: 'Crimson Text', serif; font-size: 36px; font-weight: 700; margin: 0; }

        .pr-label { display: block; font-size: 12px; font-weight: 700; color: #3b4a66; margin-bottom: 6px; }
        .pr-field {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #b4c1d6;
          border-radius: 12px;
          background: #f1f4f9;
          padding: 14px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          color: #0b1b3a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pr-field::placeholder { color: #6b7a94; }
        .pr-field:focus { border-color: #0369a1; box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.18); }
        .pr-field.has-error { border-color: #dc2626; }
        .pr-textarea { height: 150px; resize: vertical; box-shadow: 0 8px 20px -14px rgba(11, 27, 58, 0.5); }
        .pr-input { height: 46px; padding: 0 14px; border-radius: 10px; }

        .pr-meta { display: flex; justify-content: space-between; gap: 12px; margin-top: 6px; min-height: 18px; }
        .pr-error { font-size: 12px; color: #b91c1c; font-weight: 600; margin: 0; }
        .pr-count { font-size: 11px; color: #3b4a66; margin-left: auto; }

        .pr-fieldset { border: none; padding: 0; margin: 22px 0 0; min-width: 0; }
        .pr-legend { font-family: 'Crimson Text', serif; font-size: 22px; font-weight: 700; padding: 0; margin-bottom: 12px; }
        .pr-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }

        .pr-opt {
          border-radius: 16px;
          padding: 16px;
          border: 2px solid #c9d3e2;
          background: #edf1f7;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .pr-opt.on { border-color: #0369a1; background: #e4edf7; box-shadow: 0 10px 24px -14px rgba(3, 105, 161, 0.6); }
        .pr-opt-head { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 700; cursor: pointer; }
        .pr-radio { position: absolute; opacity: 0; width: 1px; height: 1px; }
        .pr-dot {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #0b1b3a; box-sizing: border-box; flex-shrink: 0;
        }
        .pr-opt.on .pr-dot { background: #0369a1; border-color: #0369a1; box-shadow: inset 0 0 0 3px #e4edf7; }
        .pr-radio:focus-visible + .pr-dot { outline: 3px solid #dc2626; outline-offset: 3px; }
        .pr-opt-desc { margin: 6px 0 12px; font-size: 12px; line-height: 1.5; color: #3b4a66; }
        .pr-opt .pr-input { margin-bottom: 4px; }
        .pr-opt .pr-error { margin-bottom: 8px; }
        .pr-opt-fields { margin-top: 4px; }

        .pr-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

        .pr-send {
          width: 100%; height: 52px; margin-top: 20px;
          border: none; border-radius: 12px;
          background: #dc2626; color: #ffffff;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 13px;
          letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 18px -8px rgba(220, 38, 38, 0.7);
          transition: background 0.2s, transform 0.15s;
        }
        .pr-send:hover:enabled { background: #b91c1c; transform: translateY(-1px); }
        .pr-send:disabled { opacity: 0.65; cursor: wait; }
        .pr-send:focus-visible, .pr-ghost:focus-visible { outline: 3px solid #0369a1; outline-offset: 3px; }
        .pr-submit-error { text-align: center; margin: 12px 0 0; }
        .pr-note { font-size: 12px; line-height: 1.5; color: #3b4a66; text-align: center; margin: 14px 0 0; }

        /* THANK YOU */
        .pr-thanks { text-align: center; padding-top: 30px; }
        .pr-thanks-cross { font-size: 56px; color: #dc2626; line-height: 1; }
        .pr-thanks h1 { font-family: 'Crimson Text', serif; font-size: 52px; font-weight: 700; margin: 14px 0 8px; }
        .pr-thanks p { font-size: 15px; color: #3b4a66; margin: 0 0 28px; }
        .pr-thanks-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .pr-ghost {
          height: 48px; padding: 0 24px; border-radius: 12px;
          border: 2px solid #0b1b3a; background: transparent; color: #0b1b3a;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s;
        }
        .pr-ghost:hover { background: rgba(11, 27, 58, 0.07); }
        .pr-ghost.solid { background: #0b1b3a; color: #ffffff; }
        .pr-ghost.solid:hover { background: #0369a1; border-color: #0369a1; }

        @media (max-width: 640px) {
          .pr-opts { grid-template-columns: 1fr; }
          .pr-title { font-size: 30px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pr-bg, .pr-wrap { animation: none; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }, { label: 'Prayers', path: '/prayers' }]} />
      </div>

      <div className="pr-bg">
        <div className="pr-wrap">

          {view === 'form' && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="pr-top">
                <span className="pr-cross" aria-hidden="true">&#10013;</span>
                <h1 className="pr-title">Prayer Request</h1>
              </div>

              <label className="pr-label" htmlFor="pr-message">Your prayer request or message</label>
              <textarea
                id="pr-message"
                className={`pr-field pr-textarea ${errors.message ? 'has-error' : ''}`}
                placeholder="Enter your prayer request or message..."
                value={message}
                maxLength={MAX_MESSAGE}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'pr-message-error' : undefined}
              />
              <div className="pr-meta">
                {errors.message && <p id="pr-message-error" className="pr-error" role="alert">{errors.message}</p>}
                <span className="pr-count">{message.length}/{MAX_MESSAGE}</span>
              </div>

              <fieldset className="pr-fieldset">
                <legend className="pr-legend">How would you like to send it?</legend>
                <div className="pr-opts">

                  {/* WITH DETAILS */}
                  <div className={`pr-opt ${mode === 'details' ? 'on' : ''}`} onClick={() => setMode('details')}>
                    <label className="pr-opt-head">
                      <input
                        type="radio"
                        name="send-mode"
                        className="pr-radio"
                        checked={mode === 'details'}
                        onChange={() => setMode('details')}
                      />
                      <span className="pr-dot" aria-hidden="true" />
                      With my details
                    </label>
                    <p className="pr-opt-desc">The Reverend can reach out to you.</p>

                    {mode === 'details' && (
                      <div className="pr-opt-fields">
                        <input
                          type="text"
                          className={`pr-field pr-input ${errors.name ? 'has-error' : ''}`}
                          placeholder="Name"
                          aria-label="Name"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          aria-invalid={!!errors.name}
                        />
                        {errors.name && <p className="pr-error" role="alert">{errors.name}</p>}
                        <input
                          type="tel"
                          className={`pr-field pr-input ${errors.phone ? 'has-error' : ''}`}
                          placeholder="Phone number"
                          aria-label="Phone number"
                          autoComplete="tel"
                          inputMode="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          aria-invalid={!!errors.phone}
                        />
                        {errors.phone && <p className="pr-error" role="alert">{errors.phone}</p>}
                      </div>
                    )}
                  </div>

                  {/* ANONYMOUS */}
                  <div className={`pr-opt ${mode === 'anonymous' ? 'on' : ''}`} onClick={() => setMode('anonymous')}>
                    <label className="pr-opt-head">
                      <input
                        type="radio"
                        name="send-mode"
                        className="pr-radio"
                        checked={mode === 'anonymous'}
                        onChange={() => setMode('anonymous')}
                      />
                      <span className="pr-dot" aria-hidden="true" />
                      Anonymously
                    </label>
                    <p className="pr-opt-desc">No name or phone number is sent with your message.</p>
                  </div>

                </div>
              </fieldset>

              {/* Hidden spam trap */}
              <div className="pr-hp" aria-hidden="true">
                <label>
                  Leave this field empty
                  <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </label>
              </div>

              <button type="submit" className="pr-send" disabled={sending}>
                {sending ? 'Sending...' : 'Send prayer request'}
              </button>
              {submitError && <p className="pr-error pr-submit-error" role="alert">{submitError}</p>}

              <p className="pr-note">
                {mode === 'details'
                  ? 'Your name and phone number are used only so the church can follow up on your request.'
                  : 'Your request will be sent without any personal details.'}
              </p>
            </form>
          )}

          {view === 'thankyou' && (
            <div className="pr-thanks" role="status">
              <div className="pr-thanks-cross" aria-hidden="true">&#10013;</div>
              <h1>Thank you</h1>
              <p>Your prayer request has been sent. We are praying with you.</p>
              <div className="pr-thanks-actions">
                <button className="pr-ghost" onClick={resetForm}>Send another request</button>
                <button className="pr-ghost solid" onClick={() => navigate('/')}>Back to home</button>
              </div>
            </div>
          )}

        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
    </div>
  );
};

export default PrayersScreen;