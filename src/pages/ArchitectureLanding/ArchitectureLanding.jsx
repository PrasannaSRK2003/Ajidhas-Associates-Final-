import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './ArchitectureLanding.css';

import thumb1 from '../../assets/hero_architecture.png';
import thumb2 from '../../assets/arch_project_1.png';
import thumb3 from '../../assets/arch_project_2.png';
import thumb4 from '../../assets/villa_solenne.png';
import thumb5 from '../../assets/villa_lumiere.png';
import thumb6 from '../../assets/penthouse_reveal.png';
import thumb7 from '../../assets/abstract_architecture_hero.png';
import thumb8 from '../../assets/building1.png';
import thumb9 from '../../assets/waiting_hall.jpeg';

const architectureOptions = [
    { id: 1, title: 'All Work', path: '/architecture/all-work', description: 'Complete portfolio', image: thumb1 },
    { id: 2, title: 'Projects', path: '/architecture/projects', description: 'Featured projects', image: thumb2 },
    { id: 3, title: 'Collaboration', path: '/architecture/collaboration', description: 'Partner with us', image: thumb3 },
    { id: 4, title: 'Interior', path: '/architecture/interior', description: 'Interior design', image: thumb4 },
    { id: 5, title: 'Landscape', path: '/architecture/landscape', description: 'Landscape architecture', image: thumb5 },
    { id: 6, title: 'Technology', path: '/architecture/technology', description: 'Tech & innovation', image: thumb6 },
    { id: 7, title: 'Visualisation', path: '/architecture/visualisation', description: '3D & renders', image: thumb7 },
    { id: 8, title: 'About', path: '/architecture/about', description: 'Our story', image: thumb8 },
    { id: 9, title: 'Contact', path: '/architecture/contact', description: 'Get in touch', image: thumb9 },
];

const ArchitectureLanding = () => {
    const { getText } = useContent();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef(null);
    const gridRef = useRef(null);
    const headerTitle = getText('architecture', 'header_title', 'Architecture');
    const goTo = (path) => { setMenuOpen(false); navigate(path); };

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(headerRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' });
        tl.fromTo(gridRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .05, ease: 'power3.out' }, '-=.3');
        return () => tl.kill();
    }, []);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [menuOpen]);

    return (
        <div className="arch-landing-page">
            <div className="arch-background" aria-hidden="true" />
            <header className="arch-topbar">
                <div className="arch-topbar__left">
                    <button className="arch-topbar__back" type="button" onClick={() => navigate(-1)} aria-label="Go back"><IoArrowBack /></button>
                    <span className="arch-topbar__accent" aria-hidden="true" /><Link className="arch-topbar__index" to="/">INDEX 06</Link>
                </div>
                <button className="arch-topbar__menu" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="architecture-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
            </header>
            <main className="arch-content">
                <div className="arch-header" ref={headerRef}><p className="arch-header__eyebrow">AJIDHAS &amp; ASSOCIATES</p><h1>{headerTitle}</h1></div>
                <nav className="arch-grid" ref={gridRef} aria-label="Architecture sections">
                    {architectureOptions.map((option) => (
                        <button key={option.id} className="arch-card" type="button" onClick={() => navigate(option.path)}>
                            <img src={option.image} alt="" />
                            <div className="cad-content"><h3>{option.title}</h3><p>{option.description}</p></div>
                            <span className="card-arrow" aria-hidden="true">→</span>
                        </button>
                    ))}
                </nav>
            </main>
            <button className={`arch-menu-backdrop${menuOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation menu" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
            <aside id="architecture-menu" className={`arch-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
                <p>AJIDHAS & ASSOCIATES</p>
                {architectureOptions.map((option) => <button key={option.id} type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo(option.path)}>{option.title}<span>{String(option.id).padStart(2, '0')}</span></button>)}
            </aside>
        </div>
    );
};

export default ArchitectureLanding;



