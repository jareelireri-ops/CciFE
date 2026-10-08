import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, MapPin } from '@phosphor-icons/react';

// Shared site components, same ones HomeScreen uses (adjust paths if needed)
import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

// ── DATE HELPERS ──
// Format a Date as YYYY-MM-DD in local time
const toKey = (d) => d.toLocaleDateString('en-CA');
// Parse YYYY-MM-DD as a LOCAL date (avoids timezone off-by-one bugs)
const parseLocal = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
// Sample helper so the demo events are always upcoming. Replace with real dates.
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toKey(d);
};

// Category tag colours (blue, red, silver-slate to match the theme)
const CATEGORY_COLORS = {
  Conference: '#0369a1',
  Worship: '#dc2626',
  Youth: '#475569',
};

// ── SAMPLE EVENTS (replace dates with real 'YYYY-MM-DD' strings) ──
const EVENTS = [
  {
    id: 1,
    title: "Men's Conference",
    date: inDays(2),
    time: '5:30 PM',
    location: 'Church',
    description: 'Empowering the men of the sanctuary in word and fellowship.',
    category: 'Conference',
    poster: 'https://images.unsplash.com/photo-1475721027187-402ad2989a38?auto=format&fit=crop&w=800',
  },
  {
    id: 2,
    title: 'Music Extravaganza',
    date: inDays(9),
    time: '2:00 PM',
    location: 'UNICAS Garden',
    description: 'A massive celebration of praise and worship in the garden.',
    category: 'Worship',
    poster: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800',
  },
  {
    id: 3,
    title: 'Senior Youth Day',
    date: inDays(16),
    time: '10:00 AM',
    location: 'Church',
    description: 'Focusing on the next generation of leaders.',
    category: 'Youth',
    poster: 'https://images.unsplash.com/photo-1523580494863-6f30312248fd?auto=format&fit=crop&w=800',
  },
  {
    id: 4,
    title: 'Junior Youth Day',
    date: inDays(23),
    time: '9:00 AM',
    location: 'UNICAS Garden',
    description: 'A fun-filled day of activities for our younger stars.',
    category: 'Youth',
    poster: 'https://images.unsplash.com/photo-1472653376319-380a7ece254a?auto=format&fit=crop&w=800',
  },
];

// ── SCREEN ──
const EventsScreen = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewedMonth, setViewedMonth] = useState(new Date());

  // Always start at the top when this page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toKey(today);

  // Upcoming events in the month being viewed, soonest first
  const viewedMonthEvents = EVENTS
    .filter((e) => {
      const d = parseLocal(e.date);
      return d >= today &&
        d.getMonth() === viewedMonth.getMonth() &&
        d.getFullYear() === viewedMonth.getFullYear();
    })
    .sort((a, b) => parseLocal(a.date) - parseLocal(b.date));

  // Events on the clicked date
  const selectedEvents = selectedDate
    ? EVENTS.filter((e) => e.date === toKey(selectedDate))
    : [];

  const visibleEvents = selectedDate ? selectedEvents : viewedMonthEvents;

  const handleDateClick = (date) => {
    if (date < today) return;
    setSelectedDate(selectedDate && selectedDate.toDateString() === date.toDateString() ? null : date);
  };

  const goToToday = () => {
    setViewedMonth(new Date());
    setSelectedDate(null);
  };

  const monthLabel = viewedMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e3e8f0', color: '#0b1b3a', fontFamily: "system-ui, -apple-system, sans-serif", overflowX: 'hidden', position: 'relative' }}>
      <style>{`
        /* Silver-blue palette shared with Home and Announcements:
           silver #e3e8f0 | panel #edf1f7 | border #c9d3e2
           navy #0b1b3a | slate #3b4a66 | blue #0369a1 | red #dc2626 */

        .ev-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: evBgLoop 20s ease infinite;
          width: 100%;
        }
        @keyframes evBgLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ev-wrap { max-width: 1040px; margin: 0 auto; padding: 40px 24px 90px; }

        .ev-main {
          display: flex;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 22px 46px -20px rgba(11, 27, 58, 0.6);
          animation: evIn 0.5s ease both;
        }
        @keyframes evIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

        /* ── NAVY CALENDAR PANEL ── */
        .ev-cal-panel {
          width: 360px;
          flex-shrink: 0;
          box-sizing: border-box;
          padding: 28px 22px 24px;
          background: linear-gradient(160deg, #0f2a52, #0b1a38);
          color: #ffffff;
          position: relative;
        }
        .ev-cal-panel::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #7dd3fc 40%, #e3e8f0 40% 70%, #dc2626 70%);
        }

        .ev-cal-panel .react-calendar {
          background: transparent !important;
          border: none !important;
          color: #ffffff !important;
          width: 100% !important;
          font-family: 'Montserrat', sans-serif;
        }
        .ev-cal-panel .react-calendar__navigation { height: 48px; margin-bottom: 8px; }
        .ev-cal-panel .react-calendar__navigation button {
          color: #ffffff !important;
          min-width: 44px;
          background: none !important;
          border-radius: 10px;
          font-size: 1.2rem;
        }
        .ev-cal-panel .react-calendar__navigation button:enabled:hover,
        .ev-cal-panel .react-calendar__navigation button:enabled:focus { background: rgba(255,255,255,0.12) !important; }
        .ev-cal-panel .react-calendar__navigation__label {
          font-family: 'Crimson Text', serif;
          font-weight: 700;
          font-size: 1.25rem !important;
        }
        .ev-cal-panel .react-calendar__month-view__weekdays { text-align: center; }
        .ev-cal-panel .react-calendar__month-view__weekdays__weekday { padding: 4px 0; }
        .ev-cal-panel .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          color: #9fb3d1;
        }
        .ev-cal-panel .react-calendar__tile {
          color: #ffffff !important;
          background: none !important;
          height: 44px;
          border-radius: 8px;
          position: relative;
          font-size: 13px;
        }
        .ev-cal-panel .react-calendar__month-view__days__day--neighboringMonth { color: #8aa0c2 !important; }
        .ev-cal-panel .react-calendar__tile:enabled:hover,
        .ev-cal-panel .react-calendar__tile:enabled:focus { background: rgba(255,255,255,0.14) !important; }
        .ev-cal-panel .react-calendar__tile:disabled { color: #8aa0c2 !important; opacity: 0.55; cursor: default; }
        .ev-cal-panel .react-calendar__tile--now { background: #dc2626 !important; color: #ffffff !important; font-weight: 700; }
        .ev-cal-panel .react-calendar__tile--now:disabled { opacity: 1; color: #ffffff !important; }
        .ev-cal-panel .react-calendar__tile--active { background: #e3e8f0 !important; color: #0b1b3a !important; font-weight: 700; }
        .ev-cal-panel .event-day::after {
          content: '';
          position: absolute; bottom: 5px; left: 50%;
          width: 5px; height: 5px; margin-left: -2.5px;
          border-radius: 50%;
          background: #7dd3fc;
        }
        .ev-cal-panel .react-calendar__tile--active.event-day::after { background: #0b1b3a; }

        .ev-btn {
          width: 100%;
          height: 46px;
          margin-top: 14px;
          border: none;
          border-radius: 12px;
          background: #e3e8f0;
          color: #0b1b3a;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .ev-btn:hover { background: #ffffff; transform: translateY(-1px); }
        .ev-btn:focus-visible, .ev-clear:focus-visible { outline: 3px solid #dc2626; outline-offset: 3px; }

        /* ── EVENTS LIST ── */
        .ev-list-panel { flex: 1; min-width: 0; background: #edf1f7; padding: 30px 32px; }
        .ev-list-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .ev-list-title { font-family: 'Crimson Text', serif; font-size: 30px; font-weight: 700; margin: 0; color: #0b1b3a; }
        .ev-list-sub { font-family: 'Montserrat', sans-serif; font-size: 13px; color: #3b4a66; margin: 4px 0 0; }
        .ev-clear {
          flex-shrink: 0;
          height: 40px; padding: 0 16px;
          border: 1px solid #c9d3e2; border-radius: 10px;
          background: transparent; color: #0b1b3a;
          font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 12px;
          cursor: pointer;
        }
        .ev-clear:hover { background: rgba(11, 27, 58, 0.06); }

        .ev-item { border-bottom: 1px solid #c9d3e2; padding: 16px 0; animation: evIn 0.4s ease both; }
        .ev-item:last-child { border-bottom: none; }
        .ev-row { display: flex; align-items: center; gap: 16px; }
        .ev-date {
          width: 58px; height: 62px; flex-shrink: 0;
          border-radius: 12px;
          background: #0b1b3a;
          color: #ffffff;
          text-align: center;
        }
        .ev-date span { display: block; margin-top: 9px; font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 1px; font-weight: 700; color: #7dd3fc; }
        .ev-date b { font-family: 'Crimson Text', serif; font-size: 24px; font-weight: 700; line-height: 1.1; }
        .ev-item.is-today .ev-date { background: #dc2626; }
        .ev-item.is-today .ev-date span { color: #ffffff; }
        .ev-info { flex: 1; min-width: 0; }
        .ev-name { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; margin: 0; color: #0b1b3a; }
        .ev-meta { font-family: 'Montserrat', sans-serif; font-size: 12px; color: #3b4a66; margin: 3px 0 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .ev-meta svg { vertical-align: -2px; }
        .ev-tag { flex-shrink: 0; color: #ffffff; font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }

        .ev-detail { margin: 14px 0 0 74px; animation: evIn 0.3s ease both; }
        .ev-desc { font-family: 'Montserrat', sans-serif; font-size: 14px; line-height: 1.6; color: #3b4a66; margin: 0; }
        .ev-poster {
          width: 100%; height: 190px; object-fit: cover;
          border-radius: 14px; margin-top: 12px;
          border: 3px solid #e3e8f0;
          cursor: zoom-in; display: block;
          transition: filter 0.2s;
        }
        .ev-poster:hover { filter: brightness(1.06); }

        .ev-empty { text-align: center; padding: 50px 0; color: #3b4a66; font-family: 'Montserrat', sans-serif; font-size: 14px; }

        @media (max-width: 860px) {
          .ev-main { flex-direction: column; }
          .ev-cal-panel { width: 100%; }
          .ev-list-panel { padding: 24px 20px; }
          .ev-detail { margin-left: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-bg { animation: none; }
          .ev-main, .ev-item, .ev-detail { animation: none; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }, { label: 'Events', path: '/events' }]} />
      </div>

      <div className="ev-bg">
        <div className="ev-wrap">
          <div className="ev-main">

            {/* ── CALENDAR PANEL ── */}
            <div className="ev-cal-panel">
              <Calendar
                onClickDay={handleDateClick}
                onActiveStartDateChange={({ activeStartDate }) => activeStartDate && setViewedMonth(activeStartDate)}
                activeStartDate={new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1)}
                value={selectedDate}
                calendarType="iso8601"
                formatShortWeekday={(locale, date) => date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2)}
                tileDisabled={({ date, view }) => view === 'month' && date < today}
                tileClassName={({ date, view }) =>
                  view === 'month' && EVENTS.some((e) => e.date === toKey(date)) ? 'event-day' : null
                }
              />
              <button className="ev-btn" onClick={goToToday}>Go to Today</button>
            </div>

            {/* ── EVENTS LIST PANEL ── */}
            <div className="ev-list-panel">
              <div className="ev-list-head">
                <div>
                  <h2 className="ev-list-title">
                    {selectedDate ? 'Events' : 'Upcoming Events'}
                  </h2>
                  <p className="ev-list-sub">
                    {selectedDate ? selectedDate.toDateString() : monthLabel}
                  </p>
                </div>
                {selectedDate && (
                  <button className="ev-clear" onClick={() => setSelectedDate(null)}>Clear selection</button>
                )}
              </div>

              {visibleEvents.length > 0 ? (
                visibleEvents.map((event, i) => {
                  const d = parseLocal(event.date);
                  return (
                    <div
                      key={event.id}
                      className={`ev-item ${event.date === todayStr ? 'is-today' : ''}`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <div className="ev-row">
                        <div className="ev-date">
                          <span>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</span>
                          <b>{d.getDate()}</b>
                        </div>
                        <div className="ev-info">
                          <h3 className="ev-name">{event.title}</h3>
                          <p className="ev-meta">
                            <Clock size={13} weight="bold" /> {event.time}
                            <span aria-hidden="true">&middot;</span>
                            <MapPin size={13} weight="bold" /> {event.location}
                          </p>
                        </div>
                        <span className="ev-tag" style={{ background: CATEGORY_COLORS[event.category] || '#475569' }}>
                          {event.category}
                        </span>
                      </div>

                      {selectedDate && (
                        <div className="ev-detail">
                          <p className="ev-desc">{event.description}</p>
                          {event.poster && (
                            <img
                              src={event.poster}
                              alt={`${event.title} poster`}
                              className="ev-poster"
                              onClick={() => window.open(event.poster, '_blank')}
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="ev-empty">
                  {selectedDate ? 'No events on this date.' : 'No upcoming events this month. Stay tuned!'}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
    </div>
  );
};

export default EventsScreen;