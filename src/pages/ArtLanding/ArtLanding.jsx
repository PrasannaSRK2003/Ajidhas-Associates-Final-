import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useContent } from '../../context/useContent';
import './ArtLanding.css';

const ArtLanding = () => {
    const navigate = useNavigate();
    const { wpContent, loading } = useContent();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuToggleRef = useRef(null);
    const works = Array.isArray(wpContent?.art?.items)
        ? wpContent.art.items.filter((item) => item && (item.image || item.title))
        : [];
    const activeIndex = works.length ? currentSlide % works.length : 0;
    const currentWork = works[activeIndex];

    useEffect(() => {
        if (works.length < 2) return undefined;
        const timer = window.setInterval(() => setCurrentSlide((index) => (index + 1) % works.length), 5000);
        return () => window.clearInterval(timer);
    }, [works.length]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [menuOpen]);

    const goTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="art-studio-page">
            <div className="art-studio-page__background" aria-hidden="true" />
            <header className="art-studio-header">
                <Link className="art-studio-header__index" to="/" aria-label="Ajidhas Associates home">INDEX 02 / ART</Link>
                <button
                    ref={menuToggleRef}
                    className={`art-studio-header__menu${menuOpen ? ' is-open' : ''}`}
                    type="button"
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={menuOpen}
                    aria-controls="art-studio-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                ><span /><span /><span /></button>
            </header>

            <main className="art-studio-main">
                <section className="art-studio-hero" aria-labelledby="art-studio-title">
                    <span className="art-studio-hero__rule" />
                    <p className="art-studio-hero__eyebrow">ART STUDIO</p>
                    <h1 id="art-studio-title">The Art Studio</h1>
                    <p className="art-studio-hero__subtitle">CURATED WORKS FROM VISIONARY ARTISTS</p>
                </section>

                <section className="art-feature" aria-label="Featured artwork" aria-live="polite">
                    {currentWork ? <>
                        <div className="art-feature__image">
                            {currentWork.image ? <img src={currentWork.image} alt={currentWork.title || 'Featured artwork'} /> : <div className="art-feature__image-empty">Artwork image unavailable</div>}
                        </div>
                        <div className="art-feature__details">
                            <p className="art-feature__label">FEATURED WORK</p>
                            <span className="art-feature__rule" />
                            <h2>{currentWork.title}</h2>
                            <p className="art-feature__meta">{[currentWork.artist, currentWork.year, currentWork.medium].filter(Boolean).join('  ·  ')}</p>
                        </div>
                    </> : <div className="art-feature__empty">{loading ? 'Loading featured artwork…' : 'No featured artwork is available yet.'}</div>}
                </section>

                <nav className="art-studio-actions" aria-label="Explore the art studio">
                    <button type="button" onClick={() => navigate('/art/gallery')}>GALLERY <span>→</span></button>
                    <button type="button" onClick={() => navigate('/art/artist')}>ARTISTS <span>→</span></button>
                </nav>

                {works.length > 1 && <div className="art-studio-pagination" aria-label="Featured artwork slides">
                    {works.map((work, index) => <button
                        type="button"
                        key={work.id || `${work.title || 'work'}-${index}`}
                        className={index === activeIndex ? 'is-active' : ''}
                        aria-label={`Show artwork ${index + 1}`}
                        aria-current={index === activeIndex ? 'true' : undefined}
                        onClick={() => setCurrentSlide(index)}
                    />)}
                </div>}
            </main>

            <button className={`art-studio-menu-backdrop${menuOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation menu" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
            <aside id="art-studio-menu" className={`art-studio-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
                <p className="art-studio-menu__eyebrow">AJIDHAS ASSOCIATES</p>
                <p className="art-studio-menu__heading">Explore the studio</p>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/')}>Studio <span>01</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/art')}>Art Studio <span>02</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/architecture')}>Architecture <span>03</span></button>
                <p className="art-studio-menu__footer">Art and architecture, thoughtfully made.</p>
            </aside>
        </div>
    );
};

export default ArtLanding;

