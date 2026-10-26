import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Art.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

gsap.registerPlugin(ScrollTrigger);

const artPieces = [
    {
        id: 1,
        title: 'Ethereal Silence',
        artist: 'Ajidhas',
        description: 'An exploration of texture and void, capturing the silence of abandoned spaces.',
        contact: 'ajidhas@gmail.com',
        image: art1,
    },
    {
        id: 2,
        title: 'Bronze Form No. 4',
        artist: 'Ajidhas',
        description: 'A study in weight and balance, casting dramatic shadows that change with the light.',
        contact: 'ajidhas@gmail.com',
        image: art2,
    },
    {
        id: 3,
        title: 'Monolith',
        artist: 'Ajidhas',
        description: 'High contrast architectural photography focusing on brutalist geometry.',
        contact: 'ajidhas@gmail.com',
        image: art3,
    },
    {
        id: 4,
        title: 'Urban Echo',
        artist: 'Ajidhas',
        description: 'Abstract interpretation of city rhythms and urban decay.',
        contact: 'ajidhas@gmail.com',
        image: art1,
    },
];

const Art = () => {
    const containerRef = useRef(null);
    const [currentBg, setCurrentBg] = useState(artPieces[0].image);
    const [prevBg, setPrevBg] = useState(null);
    const [prevFading, setPrevFading] = useState(false);
    const [currentFading, setCurrentFading] = useState(true);
    const currentBgRef = useRef(artPieces[0].image);
    const fadeStartTimerRef = useRef();
    const fadeCleanupTimerRef = useRef();

    const changeBg = useCallback((image) => {
        const previousImage = currentBgRef.current;
        if (!image || image === previousImage) return;

        document.body.classList.add('bg-transitioning');

        const incoming = new Image();
        incoming.src = image;
        incoming.onload = () => {
            currentBgRef.current = image;
            setPrevBg(previousImage);
            setPrevFading(false);
            setCurrentFading(false);
            setCurrentBg(image);

            fadeStartTimerRef.current = window.setTimeout(() => {
                setCurrentFading(true);
                setPrevFading(true);
            }, 40);

            fadeCleanupTimerRef.current = window.setTimeout(() => {
                setPrevBg(null);
                setPrevFading(false);
                document.body.classList.remove('bg-transitioning');
            }, 1000);
        };
        incoming.onerror = () => {
            document.body.classList.remove('bg-transitioning');
        };
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
        // Preload all background images to avoid flicker/blank while swapping
        artPieces.forEach(p => {
            const img = new Image();
            img.src = p.image;
        });
        const sections = gsap.utils.toArray('.art-project-section');

        sections.forEach((section, i) => {
            const content = section.querySelector('.art-content-wrapper');
            const image = section.querySelector('.art-image-wrapper img');
            const bgImage = artPieces[i].image;

            // Animate content reveal
            gsap.fromTo(
                content,
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 60%',
                        end: 'top 20%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Fade-in image when section enters (remove scroll-driven parallax)
            gsap.fromTo(
                image,
                { opacity: 0, scale: 1.05 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 70%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Update fixed background image using crossfade (avoid blinking)
            ScrollTrigger.create({
                trigger: section,
                start: 'top 50%',
                end: 'bottom 50%',
                onEnter: () => {
                    changeBg(bgImage);
                },
                onEnterBack: () => {
                    changeBg(bgImage);
                },
            });
        });

        }, containerRef);

        return () => ctx.revert();
    }, [changeBg]);

    useEffect(() => () => {
        clearTimeout(fadeStartTimerRef.current);
        clearTimeout(fadeCleanupTimerRef.current);
        document.body.classList.remove('bg-transitioning');
    }, []);

    return (
        <div className="art-page" ref={containerRef}>
            <div className="art-background">
                {prevBg && (
                    <img
                        src={prevBg}
                        alt="Background previous"
                        className={`bg-image prev ${prevFading ? 'fade-out' : ''}`}
                    />
                )}
                <img src={currentBg} alt="Background" className={`bg-image current ${currentFading ? 'fade-in' : ''}`} />
                <div className="overlay"></div>
            </div>

            <header className="art-header-fixed">
                <h1>Gallery</h1>
            </header>

            {artPieces.map((art, index) => (
                <section className="art-project-section" key={art.id}>
                    <div className="art-content-wrapper">
                        <div className="art-image-wrapper">
                            <img src={art.image} alt={art.title} />
                        </div>
                        <div className="art-details">
                            <div className="art-info">
                                <span className="project-number">0{index + 1}</span>
                                <h3>{art.title}</h3>
                                <h4>{art.artist}</h4>
                                <p className="description">{art.description}</p>
                            </div>
                            <div className="art-contact">
                                <p>Inquire</p>
                                <a href={`mailto:${art.contact}`}>{art.contact}</a>
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            <div className="scroll-hint-fixed">
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
            </div>
        </div>
    );
};

export default Art;
