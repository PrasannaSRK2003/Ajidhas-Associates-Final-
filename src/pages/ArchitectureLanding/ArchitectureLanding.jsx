import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './ArchitectureLanding.css';

import bg1 from '../../assets/hero_bg_night.png';
import bg2 from '../../assets/hero_bg_architecture.png';
import bg3 from '../../assets/home_bg.png';

const defaultBackgroundImages = [bg1, bg2, bg3];

const architectureOptions = [
    { id: 1, title: 'All Work', path: '/architecture/all-work', description: 'Complete portfolio' },
    { id: 2, title: 'Projects', path: '/architecture/projects', description: 'Featured projects' },
    { id: 3, title: 'Collaboration', path: '/architecture/collaboration', description: 'Partner with us' },
    { id: 4, title: 'Interior', path: '/architecture/interior', description: 'Interior design' },
    { id: 5, title: 'Landscape', path: '/architecture/landscape', description: 'Landscape architecture' },
    { id: 6, title: 'Technology', path: '/architecture/technology', description: 'Tech & innovation' },
    { id: 7, title: 'Visualisation', path: '/architecture/visualisation', description: '3D & renders' },
    { id: 8, title: 'About', path: '/architecture/about', description: 'Our story' },
    { id: 9, title: 'Contact', path: '/architecture/contact', description: 'Get in touch' },
];

const ArchitectureLanding = () => {
    const { getText, getImage } = useContent();
    const [currentBg, setCurrentBg] = useState(0);
    const navigate = useNavigate();
    const headerRef = useRef(null);
    const gridRef = useRef(null);

    const headerTitle = getText('architecture', 'header_title', 'Architecture');
    const backgroundImages = [
        getImage('architecture', 0, defaultBackgroundImages[0]),
        getImage('architecture', 1, defaultBackgroundImages[1]),
        getImage('architecture', 2, defaultBackgroundImages[2]),
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length]);

    useEffect(() => {
        const tl = gsap.timeline();

        tl.fromTo(
            headerRef.current,
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
        );

        tl.fromTo(
            gridRef.current.children,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
            '-=0.5'
        );
    }, []);

    return (
        <div className="arch-landing-page">
            <div className="arch-background">
                {backgroundImages.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Background ${index}`}
                        className={`arch-bg-slide ${index === currentBg ? 'active' : ''}`}
                    />
                ))}
                <div className="arch-overlay"></div>
            </div>

            <div className="arch-content">
                <div className="arch-header" ref={headerRef}>
                    <h1>{headerTitle}</h1>
                </div>

                <div className="arch-grid" ref={gridRef}>
                    {architectureOptions.map((option) => (
                        <div
                            key={option.id}
                            className="arch-card"
                            onClick={() => navigate(option.path)}
                        >
                            <div className="cad-content">
                                <h3>{option.title}</h3>
                                <p>{option.description}</p>
                            </div>
                            <div className="card-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ArchitectureLanding;
