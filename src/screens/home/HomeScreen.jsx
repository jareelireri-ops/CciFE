import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
import { CaretRight, X } from '@phosphor-icons/react';

import Navbar from '../../components/Navbar';
import Breadcrumb from '../../components/Breadcrumbs';
import Footer from '../../components/Footer';

import HeroSection from './HeroSection';
import MarqueeStrip from './MarqueeStrip';
import PathwaysGrid from './PathwaysGrid';

import '../../styles/Home.css';

gsap.registerPlugin(ScrollTrigger);

const HomeScreen = () => {
  const navigate = useNavigate();
  
  // State control for the full "Service Unavailable" modal window
  const [showSermonsModal, setShowSermonsModal] = useState(false);

  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);
  
  const modalOverlayRef = useRef(null);
  const modalContentRef = useRef(null);

  const baseUrl = import.meta.env.BASE_URL;

  // Handle opening the popup for any watch/listen actions across the page
  const openSermonsModal = () => {
    setShowSermonsModal(true);
  };

  // Handle closing the popup with a clean GSAP exit sequence
  const closeSermonsModal = () => {
    if (modalOverlayRef.current && modalContentRef.current) {
      gsap.to(modalContentRef.current, { scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to(modalOverlayRef.current, { 
        opacity: 0, 
        duration: 0.25, 
        onComplete: () => setShowSermonsModal(false) 
      });
    } else {
      setShowSermonsModal(false);
    }
  };

  // Entrance animations whenever the modal launches
  useEffect(() => {
    if (showSermonsModal && modalOverlayRef.current && modalContentRef.current) {
      gsap.fromTo(modalOverlayRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalContentRef.current, 
        { scale: 0.85, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
  }, [showSermonsModal]);

  useEffect(() => {
    const rows = [row1Ref.current, row2Ref.current, row3Ref.current];

    rows.forEach((row) => {
      if (!row) return;

      const textElements = row.querySelectorAll('.animate-text');
      const imageElement = row.querySelector('.animate-image');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 85%', 
          toggleActions: 'play none none reverse',
        }
      });

      tl.fromTo(textElements, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );

      tl.fromTo(imageElement,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        '-=0.6'
      );
    });

    ScrollTrigger.refresh();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#e3e8f0', 
      color: '#0b1b3a', 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      overflowX: 'hidden', 
      position: 'relative' 
    }}>
      
      <style>{`
        /* Silver-blue palette (near white, never pure white):
           silver #e3e8f0 | soft silver #eef0f3 | deep silver #d3dbe7
           border #c0cad9 | ink navy #0b1b3a | blue #0369a1 | red #dc2626 */

        /* Slow looping silver background */
        .animated-loop-bg {
          background: linear-gradient(135deg, #e9eef5, #dae1eb, #edf1f7, #d5dde8, #e9eef5);
          background-size: 400% 400%;
          animation: backgroundLoop 20s ease infinite; 
          width: 100%;
        }
        @keyframes backgroundLoop {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animated-loop-bg { animation: none; }
        }

        .feature-row-section {
          width: 100%;
          position: relative;
          z-index: 10;
        }
        
        .feature-row {
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          padding: clamp(50px, 6vw, 80px) 40px;
        }

        /* Full-width string of small crosses, now dark so it shows on silver */
        .cross-divider-line {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          overflow: hidden;
          white-space: nowrap;
          display: flex;
          justify-content: center;
          align-items: center;
          user-select: none;
          padding: 24px 0;
          opacity: 0.4; 
        }

        .cross-string {
          color: #0b1b3a;
          font-family: 'Courier New', Courier, monospace;
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 12px; 
        }

        /* ── MODAL ── */
        .modal-blur-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(11, 27, 58, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
        }

        .custom-popup-window {
          background: #e8edf4; 
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          padding: 40px 32px 36px 32px;
          position: relative;
          box-shadow: 0 30px 70px rgba(11, 27, 58, 0.35);
          border: 1px solid #c0cad9; 
          border-top: 5px solid #dc2626;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .modal-close-icon-btn {
          position: absolute;
          top: 20px;
          right: 22px;
          background: transparent;
          border: none;
          color: rgba(11, 27, 58, 0.5);
          cursor: pointer;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-icon-btn:hover {
          color: #0b1b3a;
        }

        .logo-container-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #e3e8f0;
          border: 2px solid #c0cad9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(11, 27, 58, 0.18);
        }

        .modal-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-main-title {
          font-family: 'Montserrat', -apple-system, sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #0b1b3a;
          margin: 0 0 14px 0;
          letter-spacing: -0.3px;
        }

        .modal-body-text {
          font-family: 'Montserrat', -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #3b4a66;
          margin: 0 0 16px 0;
          max-width: 360px;
        }

        .modal-signature {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: #0369a1;
          margin: 0 0 28px 0;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .modal-amen-btn {
          width: 100%;
          max-width: 160px;
          background: linear-gradient(180deg, #dc2626, #b91c1c);
          color: #ffffff;
          border: none;
          padding: 14px 0;
          border-radius: 50px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35);
          transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .modal-amen-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #ef4444, #dc2626);
          box-shadow: 0 8px 24px rgba(220, 38, 38, 0.5);
        }

        @media (max-width: 968px) {
          .feature-row {
            flex-direction: column !important;
            text-align: center;
            gap: 40px;
            padding: 40px 24px;
          }
        }
        .text-container {
          flex: 1;
          max-width: 540px;
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 968px) {
          .text-container { align-items: center; max-width: 100%; }
        }

        /* ── FEATURE ROW TEXT: dark ink on silver for strong contrast ── */
        .row-tag {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(11px, 2.2vw, 13px);
          color: #0369a1;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .row-title {
          font-family: 'Crimson Text', serif;
          font-size: clamp(32px, 5vw, 54px);
          font-weight: 700;
          color: #0b1b3a;
          line-height: 1.15;
          margin: 0 0 20px 0;
        }
        .row-description {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(14px, 2.5vw, 16px);
          color: #3b4a66;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        .row-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #0b1b3a;
          color: #ffffff;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 14px 32px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
          box-shadow: 0 4px 15px rgba(11, 27, 58, 0.25);
        }
        .row-btn:hover {
          transform: translateY(-2px);
          background-color: #0369a1;
          box-shadow: 0 8px 24px rgba(3, 105, 161, 0.35);
        }
        .row-btn:focus-visible {
          outline: 3px solid #dc2626;
          outline-offset: 3px;
        }
        @media (max-width: 968px) {
          .row-btn { align-self: center; }
        }
        .image-container {
          flex: 1.1;
          width: 100%;
          max-width: 620px;
          aspect-ratio: 4 / 3;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(11, 27, 58, 0.22);
          border: 4px solid #e6ebf3;
          background-color: #d3dbe7; 
        }
        .row-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>

      {/* ── TOP SECTION ── */}
      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Navbar />
        <Breadcrumb crumbs={[{ label: 'Home', path: '/' }]} />
        <HeroSection onWatchClick={openSermonsModal} onListenClick={openSermonsModal} />
        <MarqueeStrip />
      </div>

      {/* ── SILVER BACKGROUND WRAPPER ── */}
      <div className="animated-loop-bg" style={{ position: 'relative', zIndex: 20 }}>
        
        <PathwaysGrid />

        <div className="cross-divider-line">
          <span className="cross-string">++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++</span>
        </div>

        {/* ── ROW 1: PLEDGES & GIVING ── */}
        <div ref={row1Ref} style={{ background: 'transparent', position: 'relative', zIndex: 20 }}>
          <div className="feature-row">
            <div className="text-container">
              <span className="row-tag animate-text">Pledges & Giving</span>
              <h2 className="row-title animate-text">Empower Our Shared Mission. 2 Corinthians 9:7</h2>
              <p className="row-description animate-text">
                Looking to tithe, donate or make a lasting impact? Submit your financial commitment and support advancement of the Kingdom from anywhere.
              </p>
              <button className="row-btn animate-text" onClick={() => navigate('/giving')}>
                Make a Pledge <CaretRight size={16} weight="bold" />
              </button>
            </div>
            <div className="image-container animate-image">
              <img 
                src={`${baseUrl}church-images/pledge.jpg`} 
                alt="Community support and giving" 
                className="row-img" 
              />
            </div>
          </div>
        </div>
        
        <div className="cross-divider-line">
          <span className="cross-string">++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++</span>
        </div>

        <div className="feature-row-section">
          {/* ── ROW 2: MEMBERS CONNECT ── */}
          <div ref={row2Ref} className="feature-row" style={{ flexDirection: 'row-reverse' }}>
            <div className="text-container">
              <span className="row-tag animate-text">Members Connect</span>
              <h2 className="row-title animate-text">Find Your Community. Hebrews 10:24</h2>
              <p className="row-description animate-text">
                We are not meant to walk alone. Dive into your preferred group, connect with other members and participate in church activities as we grow our faith together.
              </p>
              <button className="row-btn animate-text" onClick={() => navigate('/members-connect')}>
                Join a Group <CaretRight size={16} weight="bold" />
              </button>
            </div>
            <div className="image-container animate-image">
              <img 
                src={`${baseUrl}church-images/MembersConnect.jpg`}
                alt="Authentic, joyful church group sharing fellowship" 
                className="row-img" 
              />
            </div>
          </div>

          <div className="cross-divider-line">
            <span className="cross-string">++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++</span>
          </div>

          {/* ── ROW 3: PREVIOUS SERMONS ── */}
          <div ref={row3Ref} className="feature-row">
            <div className="text-container">
              <span className="row-tag animate-text">Media Vault</span>
              <h2 className="row-title animate-text">Previous Sermons</h2>
              <p className="row-description animate-text">
                Missed a service or want to rewatch a powerful message? Explore our catalog of past video teachings and structural revelations to keep your spirit nourished.
              </p>
              <button className="row-btn animate-text" onClick={openSermonsModal}>
                Watch Sermons <CaretRight size={16} weight="bold" />
              </button>
            </div>
            <div className="image-container animate-image">
              <img 
                src={`${baseUrl}church-images/photo1.jpg`} 
                alt="Archive of previous church message streams" 
                className="row-img" 
              />
            </div>
          </div>
        </div>
        
      </div>

      {/* ── MODAL POPUP ── */}
      {showSermonsModal && (
        <div ref={modalOverlayRef} className="modal-blur-overlay" onClick={closeSermonsModal}>
          <div ref={modalContentRef} className="custom-popup-window" onClick={(e) => e.stopPropagation()}>
            
            <button className="modal-close-icon-btn" onClick={closeSermonsModal} aria-label="Close">
              <X size={18} weight="bold" />
            </button>

            <div className="logo-container-circle">
              <img 
                src={`${baseUrl}church-images/logo.jpg`} 
                alt="Church Logo" 
                className="modal-logo-img"
              />
            </div>

            <h3 className="modal-main-title">Service Unavailable</h3>

            <p className="modal-body-text">
              Our Media Vault broadcast is currently offline. Please join us during our scheduled service times or check back later!
            </p>

            <p className="modal-signature">Blessings, CCI Light Sanctuary</p>

            <button className="modal-amen-btn" onClick={closeSermonsModal}>
              Amen
            </button>

          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ position: 'relative', zIndex: 30, backgroundColor: '#e3e8f0' }}>
        <Footer />
      </div>
      
    </div>
  );
};

export default HomeScreen;