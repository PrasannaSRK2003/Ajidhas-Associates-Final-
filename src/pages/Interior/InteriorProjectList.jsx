import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './InteriorProjectList.css';

import buildingNight from '../../assets/building_night.png';
import villaLumiere from '../../assets/villa_lumiere.png';
import villaSolenne from '../../assets/villa_solenne.png';
import archProject1 from '../../assets/arch_project_1.png';

const defaultProjects = [
    { id: 1, title: 'Forty One Oaks', location: 'Portola Valley, CA', image: villaLumiere },
    { id: 2, title: 'Sentinal Ridge', location: 'Howell Mountain, CA', image: villaSolenne },
    { id: 3, title: 'White Sands', location: 'Carmel-by-the-sea, CA', image: archProject1 },
    { id: 4, title: 'Dawnridge', location: 'Silicon Valley, CA', image: buildingNight },
    { id: 5, title: '12 Moons', location: 'Sonoma, CA', image: villaLumiere },
    { id: 6, title: 'Foothills', location: 'Los Altos Hills, CA', image: villaSolenne },
    { id: 7, title: 'Zinfandel', location: 'St. Helena, CA', image: archProject1 },
    { id: 8, title: 'Pinon Ranch', location: 'Portola Valley, CA', image: buildingNight },
    { id: 9, title: 'Grasslands House', location: 'Carmel Valley, CA', image: villaLumiere },
];

const InteriorProjectList = () => {
    const location = useLocation();
    const { getImage, wpContent } = useContent();
    const initialId = location.state?.selectedId || 1;
    const [activeId] = useState(initialId);
    const [introComplete, setIntroComplete] = useState(false);
    const imageRef = useRef(null);
    const introRef = useRef(null);

    const projects = (wpContent?.interior?.items && Array.isArray(wpContent.interior.items) && wpContent.interior.items.length > 0)
        ? wpContent.interior.items.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultProjects[idx % defaultProjects.length]?.title || `Interior Project ${idx + 1}`,
            location: item.location || defaultProjects[idx % defaultProjects.length]?.location || 'California',
            image: item.image || getImage('interior', `slide_${idx}`, defaultProjects[idx % defaultProjects.length]?.image || villaLumiere)
        }))
        : defaultProjects.map((item, idx) => ({
            ...item,
            image: getImage('interior', `slide_${idx}`, item.image)
        }));

    const activeProject = projects.find(p => p.id === activeId) || projects[0];

    // Dynamically select 5 images for the intro, centering the active one
    const activeIndex = Math.max(0, projects.findIndex(p => p.id === activeId));
    const getWrappedIndex = (idx) => (idx + projects.length) % projects.length;

    const introImages = [
        projects[getWrappedIndex(activeIndex - 2)],
        projects[getWrappedIndex(activeIndex - 1)],
        projects[activeIndex] || projects[0], // Center one (Active Project)
        projects[getWrappedIndex(activeIndex + 1)],
        projects[getWrappedIndex(activeIndex + 2)]
    ];

    useEffect(() => {
        // Hide BG initially to show black background
        gsap.set('.ipl-bg-image', { opacity: 0 });

        const tl = gsap.timeline({
            onComplete: () => setIntroComplete(true)
        });

        // 1. Intro: 5 images pop up
        tl.fromTo('.intro-img-box',
            { scale: 0, opacity: 0, y: 50 },
            { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' }
        )
            // 2. Join together (reduce gap)
            .to('.intro-container', {
                gap: '0px',
                duration: 0.6,
                ease: 'power2.inOut'
            }, '+=0.2')
            // 3. Center image expands to full screen from center
            .to('.intro-img-box:not(.center-img)', {
                opacity: 0,
                scale: 0.8,
                duration: 0.2,
                ease: 'power2.out'
            }, '+=0.1')
            .to('.intro-img-box.center-img', {
                position: 'fixed',
                top: '50%',
                left: '50%',
                xPercent: -50,
                yPercent: -50,
                width: '100vw',
                height: '100vh',
                zIndex: 10,
                duration: 1,
                ease: 'expo.inOut'
            }, '-=0.2')

            // Reveal BG Image (behind the expanded intro image)
            .to('.ipl-bg-image', { opacity: 1, duration: 0.1 }, '-=0.1')

            // 4. Reveal Main Content
            .fromTo('.ipl-content-wrapper',
                { opacity: 0 },
                { opacity: 1, duration: 0.2 },
                '-=0.2'
            )
            // Text Animations
            // Text Animations
            .fromTo('.hero-text.large',
                { y: 100, opacity: 0, rotateX: -45 },
                { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1, ease: 'power3.out' },
                '-=0.5'
            )
            .fromTo('.sun-icon',
                { scale: 0, rotation: -180, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' },
                '-=0.8'
            )
            .fromTo('.hero-divider',
                { width: '0%' },
                { width: '100%', duration: 1, ease: 'power3.inOut' },
                '-=0.8'
            )
            .fromTo('.hero-desc-wrapper',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
                '-=0.5'
            );

    }, []);

    return (
        <div className="ipl-container">
            {/* Intro Layer */}
            <div className={`intro-layer ${introComplete ? 'hidden' : ''}`} ref={introRef}>
                <div className="intro-container">
                    {introImages.map((img, index) => (
                        <div key={img.id} className={`intro-img-box ${index === 2 ? 'center-img' : ''}`}>
                            <img src={img.image} alt="" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Layer (Full Screen BG) */}
            <div className="ipl-main-layer">
                <div className="ipl-bg-wrapper">
                    <img
                        ref={imageRef}
                        src={activeProject.image}
                        alt={activeProject.title}
                        className="ipl-bg-image"
                    />
                    <div className="ipl-bg-overlay"></div>
                </div>



                <div className="ipl-content-wrapper new-layout">
                    <div className="hero-row row-1">
                        <span className="hero-text large">Redefining</span>
                        <div className="hero-icon-wrapper">
                            <div className="sun-icon">☀</div>
                        </div>
                    </div>

                    <div className="hero-divider"></div>

                    <div className="hero-row row-2">
                        <span className="hero-text large">Smart</span>
                        <div className="hero-desc-wrapper">
                            <p>Here's How Lifestyle Districts Can<br />Connect People and Create<br />Community</p>
                        </div>
                        <span className="hero-text large">Mixed-Use</span>
                    </div>

                    <div className="hero-divider"></div>


                </div>
            </div>
        </div>
    );
};

export default InteriorProjectList;
