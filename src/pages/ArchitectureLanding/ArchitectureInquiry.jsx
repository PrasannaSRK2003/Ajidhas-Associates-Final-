import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import inquiryBg from '../../assets/hero_bg_night.png';
import './ArchitectureInquiry.css';

const ArchitectureInquiry = () => {
  const { getImage, submitInquiry } = useContent();
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const currentBg = getImage('contact', 'bg_image', inquiryBg);

  useEffect(() => {
    const el = panelRef.current;
    const tl = gsap.timeline();

    tl.fromTo(
      el,
      { scale: 0, rotation: -10, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: 'elastic.out(1, 0.6)' }
    );

    tl.to(el, { rotation: 4, duration: 0.08 }).to(el, { rotation: -4, duration: 0.12 }).to(el, { rotation: 0, duration: 0.08 });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      await submitInquiry({ ...formData, type: 'architecture' });
      setStatus('success');
      setTimeout(() => {
        navigate(-1);
      }, 1800);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send inquiry.');
    }
  };

  return (
    <div className="inquiry-page">
      <div className="inquiry-backdrop" onClick={() => navigate(-1)}></div>

      <div
        className="inquiry-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(15,15,15,0.9), rgba(8,8,8,0.95)), url(${currentBg})` }}
      >
        <button className="inquiry-close" onClick={() => navigate(-1)} aria-label="Close">✕</button>
        <h2>Inquiry</h2>
        <p className="muted">Tell us about your project — we’ll get back shortly.</p>

        {status === 'success' ? (
          <div style={{ padding: '20px 0', color: '#10b981', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Inquiry Received ✓</h3>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Thank you! Redirecting...</p>
          </div>
        ) : (
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" />
            <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message" required></textarea>
            {status === 'error' && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errorMsg}</p>}
            <div className="inquiry-actions">
              <button type="submit" className="inquiry-submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Send'}
              </button>
              <button type="button" className="inquiry-cancel" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ArchitectureInquiry;
