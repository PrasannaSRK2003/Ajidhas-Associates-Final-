import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './ArchitectureContact.css';
import mapBg from '../../assets/dark_architectural_map.png';

const ArchitectureContact = () => {
  const { getText, getImage, submitInquiry } = useContent();
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const titleText = getText('contact', 'title', 'Get in Touch');
  const visitTitle = getText('contact', 'visit_title', 'Visit Us');
  const addressText = getText('general', 'contact_address', 'Chennai, India');
  const emailText = getText('general', 'contact_email', 'ajidhassandassociates@gmail.com');
  const phoneText = getText('general', 'contact_phone', '+91 9790847621');
  const mapImage = getImage('contact', 'map_image', mapBg);
  const googleMapsUrl = getText('contact', 'google_maps_url', 'https://maps.google.com');
  const instagramUrl = getText('contact', 'social_instagram', 'https://www.instagram.com/ajidhas_sand_associates/');
  const linkedinUrl = getText('contact', 'social_linkedin', 'https://www.linkedin.com/company/ajidhas-sand-associates/');

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(infoRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.5'
      )
      .fromTo(formRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      if (submitInquiry) {
        await submitInquiry({ ...formData, type: 'architecture_contact' });
      }
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to submit message. Please try again.');
    }
  };

  return (
    <div className="arch-contact-page" ref={containerRef}>

      <div className="contact-container">
        <div className="contact-header">
          <h1>{titleText}</h1>
        </div>

        <div className="contact-content">
          <div className="contact-info" ref={infoRef}>
            <div className="info-group">
              <h3>{visitTitle}</h3>
              <p>{addressText}</p>
            </div>

            <div className="info-group">
              <h3>Contact</h3>
              <p>
                <a href={`mailto:${emailText}`}>{emailText}</a>
                <br />
                <a href={`tel:${phoneText.replace(/\s+/g, '')}`}>{phoneText}</a>
              </p>
            </div>

            <div className="info-group">
              <h3>Socials</h3>
              <div className="social-links">
                {instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>}
                {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer">LinkedIn</a>}
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper" ref={formRef}>
            {status === 'success' ? (
              <div className="contact-form" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '300px' }}>
                <h3 style={{ color: 'var(--color-dark-charcoal)', fontSize: '1.8rem', marginBottom: '10px' }}>Message Received ✓</h3>
                <p style={{ color: 'var(--color-deep-grey)', lineHeight: '1.6', marginBottom: '20px' }}>Thank you for reaching out! Your inquiry has been saved in our CRM database and our team will get back to you shortly.</p>
                <button type="button" className="submit-btn" onClick={() => setStatus('idle')}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" value={formData.subject} onChange={handleChange} placeholder="Project Inquiry" />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" value={formData.message} onChange={handleChange} required placeholder="Tell us about your project..." rows="5"></textarea>
                </div>

                {status === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px' }}>{errorMsg}</p>
                )}

                <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  <span className="btn-arrow">→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="contact-map-section">
        <div className="map-background">
          <img src={mapImage} alt="Map" />
          <div className="map-overlay"></div>
        </div>

        <div className="map-content">
          <div className="map-top">
            <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="google-maps-link">
              look at google maps <span className="link-line"></span>
            </a>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="location-button"
          >
            <span className="loc-dot"></span>
            Our Location
          </a>

          <div className="map-bottom">
            <h2 className="contact-us-text">Contact us</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureContact;
