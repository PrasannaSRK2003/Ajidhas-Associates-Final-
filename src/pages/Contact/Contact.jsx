import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './Contact.css';

import buildingNight from '../../assets/building_night.png';

const Contact = () => {
    const { getText, getImage, submitInquiry } = useContent();
    const formRef = useRef(null);
    const infoRef = useRef(null);
    const titleRef = useRef(null);

    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');

    const bgImg = getImage('contact', 'bg_image', buildingNight);
    const titleText = getText('contact', 'title', "Let's Build\nTogether.");
    const emailAddr = getText('general', 'contact_email', 'ajidhassandassociates@gmail.com');
    const phoneNum = getText('general', 'contact_phone', '+91 9790847621');
    const officeAddr = getText('general', 'contact_address', 'Chennai, India\nAvailable Worldwide');

    useEffect(() => {
        const tl = gsap.timeline();

        tl.fromTo(titleRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
        )
            .fromTo(infoRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
                '-=0.5'
            )
            .fromTo(formRef.current,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
                '-=0.8'
            );
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        try {
            await submitInquiry({ ...formData, type: 'general' });
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message || 'Failed to submit inquiry. Please try again.');
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-bg">
                <img src={bgImg} alt="Background" />
                <div className="contact-overlay"></div>
            </div>

            <div className="contact-container">
                <div className="contact-content">
                    <div className="contact-left" ref={infoRef}>
                        <h1 className="contact-title" ref={titleRef}>
                            {titleText.includes('\n') ? (
                                titleText.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i === 0 && <br />}
                                    </React.Fragment>
                                ))
                            ) : titleText}
                        </h1>

                        <div className="contact-info-block">
                            <span className="info-label">Email</span>
                            <a href={`mailto:${emailAddr}`} className="info-value">{emailAddr}</a>
                        </div>

                        <div className="contact-info-block">
                            <span className="info-label">Phone</span>
                            <p className="info-value">{phoneNum}</p>
                        </div>

                        <div className="contact-info-block">
                            <span className="info-label">Office</span>
                            <p className="info-value">
                                {officeAddr.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i === 0 && <br />}
                                    </React.Fragment>
                                ))}
                            </p>
                        </div>

                        <div className="contact-socials">
                            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
                            <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </div>
                    </div>

                    <div className="contact-right">
                        {status === 'success' ? (
                            <div className="contact-form" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', minHeight: '300px' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '10px' }}>Message Received ✓</h3>
                                <p style={{ color: '#aaa', lineHeight: '1.6' }}>Thank you for reaching out! Your inquiry has been logged in our CRM and we will get back to you shortly.</p>
                                <button className="submit-btn" style={{ marginTop: '20px' }} onClick={() => setStatus('idle')}>
                                    <span>Send Another Message</span>
                                </button>
                            </div>
                        ) : (
                            <form className="contact-form" ref={formRef} onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Enter your subject" required />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your vision..." rows="5" required></textarea>
                                </div>
                                {status === 'error' && (
                                    <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px' }}>{errorMsg}</p>
                                )}
                                <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                                    <span>{status === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                                    <div className="btn-arrow">→</div>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
