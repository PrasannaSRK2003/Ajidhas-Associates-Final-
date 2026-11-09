import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './Artist.css';
import artistImg from '../../assets/artist_profile.png';

const Artist = () => {
    const navigate = useNavigate();
    const { getText, getImage } = useContent();
    const [menuOpen, setMenuOpen] = useState(false);

    const overlayFirstname = getText('art', 'overlay_firstname', 'Artist');
    const overlayLastname = getText('art', 'overlay_lastname', 'Ajidhas');
    const sectionLabel = getText('art', 'section_label', 'Visionary Creator');
    const sectionTitle = getText('art', 'section_title', 'About the Artist');
    const artistName = getText('art', 'artist_name', 'Ajidhas');
    const artistBio = getText('art', 'artist_bio', 'Blending architectural precision with abstract expressionism.');
    const artistPhilosophy = getText('art', 'artist_philosophy', '\u201cMy art is an extension of my architectural practice\u2014a search for balance in a world of chaos. Every stroke and every line is a step towards understanding the essence of our surroundings.\u201d');
    const profilePhoto = getImage('art', 'artist_image', artistImg);
    const stats = [
        { value: getText('art', 'stat_1_val', '10'), label: getText('art', 'stat_1_label', 'Exhibitions') },
        { value: getText('art', 'stat_2_val', '50'), label: getText('art', 'stat_2_label', 'Artworks') },
        { value: getText('art', 'stat_3_val', '15'), label: getText('art', 'stat_3_label', 'Awards') },
    ];

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
        <div className="artist-page">
            <header className="artist-header">
                <div className="artist-header__left">
                    <button className="artist-header__back" type="button" onClick={() => navigate(-1)} aria-label="Go back"><IoArrowBack /></button>
                    <span className="artist-header__index">INDEX 04</span>
                </div>
                <button
                    className={`artist-header__menu${menuOpen ? ' is-open' : ''}`}
                    type="button"
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={menuOpen}
                    aria-controls="artist-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                ><span /><span /><span /></button>
            </header>

            <main className="artist-main">
                <section className="artist-editorial" aria-labelledby="artist-title">
                    <div className="artist-portrait">
                        <img src={profilePhoto} alt={artistName} className="artist-portrait__image" />
                        <div className="artist-portrait__shade" />
                        <div className="artist-portrait__caption">
                            <span>{overlayFirstname}</span>
                            <strong>{overlayLastname}</strong>
                        </div>
                    </div>

                    <div className="artist-copy">
                        <div className="artist-eyebrow"><span>{sectionLabel}</span><i /></div>
                        <h1 id="artist-title">{sectionTitle}</h1>
                        <p className="artist-name">{artistName}</p>
                        <p className="artist-bio">{artistBio}</p>
                        <blockquote className="artist-quote"><p>{artistPhilosophy}</p></blockquote>
                        <div className="artist-stats">
                            {stats.map(({ value, label }) => (
                                <div className="artist-stat" key={label}>
                                    <span className="artist-stat__value">{value}{String(value).includes('+') ? '' : '+'}</span>
                                    <span className="artist-stat__label">{label}</span>
                                    <i />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <button className={`artist-menu-backdrop${menuOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation menu" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
            <aside id="artist-menu" className={`artist-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
                <p className="artist-menu__eyebrow">AJIDHAS ASSOCIATES</p>
                <p className="artist-menu__heading">Explore the studio</p>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/')}>Studio <span>01</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/art')}>Art Studio <span>02</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/art/gallery')}>Gallery <span>03</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/architecture')}>Architecture <span>04</span></button>
                <p className="artist-menu__footer">Art and architecture, thoughtfully made.</p>
            </aside>
        </div>
    );
};

export default Artist;