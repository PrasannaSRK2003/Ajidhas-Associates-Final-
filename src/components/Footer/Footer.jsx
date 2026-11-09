import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoCallOutline, IoLocationOutline, IoMailOutline } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './Footer.css';

const defaultExploreLinks = [
    { label: 'Architecture', url: '/architecture' },
    { label: 'Art Collection', url: '/art' },
    { label: 'Gallery', url: '/art/gallery' },
    { label: 'The Artist', url: '/art/artist' }
];

const Footer = () => {
    const { getText, wpContent, submitInquiry } = useContent();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error

    const brandTitle = getText('footer', 'brand_title', 'Ajidhas & Associates');
    const exploreTitle = getText('footer', 'explore_title', 'Explore');
    const contactTitle = getText('footer', 'contact_title', 'Contact');
    const newsletterTitle = getText('footer', 'newsletter_title', 'Newsletter');
    const newsletterDesc = getText('footer', 'newsletter_desc', 'Subscribe to receive updates on new projects and exhibitions.');
    const copyrightText = getText('footer', 'copyright_text', '© 2026 Ajidhas & Associates Studio. All rights reserved.');
    const privacyUrl = getText('footer', 'privacy_url', '#');
    const termsUrl = getText('footer', 'terms_url', '#');

    const emailAddr = getText('general', 'contact_email', 'ajidhassandassociates@gmail.com');
    const phoneNum = getText('general', 'contact_phone', '+91 9790847621');
    const officeAddr = getText('general', 'contact_address', 'Chennai, India');

    const exploreLinks = wpContent?.footer?.explore_links?.length > 0
        ? wpContent.footer.explore_links
        : defaultExploreLinks;

    const handleNewsletterSubmit = async (event) => {
        event.preventDefault();
        if (!email || !submitInquiry) return;
        setStatus('submitting');
        try {
            await submitInquiry({ email, type: 'newsletter_subscription' });
            setStatus('success');
            setEmail('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>{brandTitle}</h3>
                    <p>Art and Architecture Studio</p>
                    <span className="footer-brand__accent" aria-hidden="true" />
                </div>

                <div className="footer-section">
                    <h4>{exploreTitle}</h4>
                    <div className="footer-links">
                        {exploreLinks.map((link, index) => (
                            <Link key={`${link.url || link.label}-${index}`} to={link.url || '#'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="footer-section">
                    <h4>{contactTitle}</h4>
                    <div className="footer-links footer-contact-list">
                        <p className="footer-contact-item"><IoMailOutline aria-hidden="true" /><span>{emailAddr}</span></p>
                        <p className="footer-contact-item"><IoCallOutline aria-hidden="true" /><span>{phoneNum}</span></p>
                        <p className="footer-contact-item"><IoLocationOutline aria-hidden="true" /><span>{officeAddr.split('\n')[0]}</span></p>
                    </div>
                </div>

                <div className="footer-section footer-newsletter">
                    <h4>{newsletterTitle}</h4>
                    <p>{newsletterDesc}</p>
                    {status === 'success' ? (
                        <p className="footer-newsletter__message" role="status">Subscribed successfully.</p>
                    ) : (
                        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => { setEmail(event.target.value); setStatus('idle'); }}
                                placeholder="Email Address"
                                aria-label="Email address"
                                required
                            />
                            <button type="submit" aria-label="Subscribe" disabled={status === 'submitting'}>
                                <IoArrowForward aria-hidden="true" />
                            </button>
                        </form>
                    )}
                    {status === 'error' && <p className="footer-newsletter__message" role="alert">Unable to subscribe right now. Please try again.</p>}
                </div>
            </div>

            <div className="footer-bottom">
                <p>{copyrightText}</p>
                <div className="footer-legal">
                    <a href={privacyUrl}>Privacy Policy</a>
                    <a href={termsUrl}>Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;