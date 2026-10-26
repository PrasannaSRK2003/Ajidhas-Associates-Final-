import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../../context/useContent';
import './Collaboration.css';

// Using existing high-quality assets
import arch1 from '../../assets/arch_project_1.png';
import arch2 from '../../assets/arch_project_2.png';
import villa1 from '../../assets/villa_lumiere.png';

gsap.registerPlugin(ScrollTrigger);

const defaultCollabData = [
    {
        id: 1,
        title: "to the unknown",
        subtitle: "AND BACK",
        desc: "A collaborative journey into the depths of architectural surrealism, where boundaries between space and time dissolve into pure form.",
        image: villa1,
        label: "BEYOND LIMITS"
    },
    {
        id: 2,
        title: "in the clouds",
        subtitle: "GET LOST",
        desc: "Dream the impossible dream with this artistic collaboration. We merge structural integrity with the ethereal nature of the sky.",
        image: arch1,
        label: "ETHEREAL FORMS"
    },
    {
        id: 3,
        title: "silent echoes",
        subtitle: "LISTEN CLOSE",
        desc: "Exploring the resonance of minimalist structures in vast, silent landscapes. A study in acoustic and visual harmony.",
        image: arch2,
        label: "MINIMAL RESONANCE"
    },
    {
        id: 4,
        title: "liquid light",
        subtitle: "FLOW FREE",
        desc: "Where architecture meets the fluid nature of light. A collaboration focused on dynamic transparency and reflection.",
        image: villa1,
        label: "DYNAMIC FLOW"
    }
];

const Collaboration = () => {
    const containerRef = useRef(null);
    const sectionsRef = useRef([]);
    const { getImage, wpContent } = useContent();

    const collabData = (wpContent?.collaboration?.items && Array.isArray(wpContent.collaboration.items) && wpContent.collaboration.items.length > 0)
        ? wpContent.collaboration.items.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultCollabData[idx % defaultCollabData.length]?.title || `Collaboration ${idx + 1}`,
            subtitle: item.subtitle || defaultCollabData[idx % defaultCollabData.length]?.subtitle || 'AND BEYOND',
            desc: item.desc || item.description || defaultCollabData[idx % defaultCollabData.length]?.desc || '',
            label: item.label || defaultCollabData[idx % defaultCollabData.length]?.label || 'COLLABORATION',
            image: item.image || getImage('collaboration', `item_${idx}`, defaultCollabData[idx % defaultCollabData.length]?.image || villa1)
        }))
        : defaultCollabData.map((item, idx) => ({
            ...item,
            image: getImage('collaboration', `item_${idx}`, item.image)
        }));

    useEffect(() => {
        sectionsRef.current = sectionsRef.current.slice(0, collabData.length);
        const ctx = gsap.context(() => {
            const sections = sectionsRef.current;

            sections.forEach((section) => {
                if (!section) return;

                const bgImg = section.querySelector('.collab-bg-image');
                const titleChars = section.querySelectorAll('.title-char');
                const subtitle = section.querySelector('.collab-hero-subtitle');
                const desc = section.querySelector('.collab-hero-desc');
                const label = section.querySelector('.collab-label-tag');
                const contentLeft = section.querySelector('.content-left');
                const contentRight = section.querySelector('.content-right');

                // --- Advanced Image Scroll Animations ---

                // 1. Parallax + Zoom + Rotation
                gsap.fromTo(bgImg,
                    { scale: 1.4, y: '-10%', rotation: 2 },
                    {
                        scale: 1,
                        y: '10%',
                        rotation: -2,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true
                        }
                    }
                );





                // --- Content Parallax ---
                gsap.to(contentLeft, {
                    y: '-60px',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });

                gsap.to(contentRight, {
                    y: '-100px',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });

                // --- Text Entrance Timeline ---
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 45%',
                        toggleActions: 'play none none reverse'
                    }
                });

                tl.fromTo(label,
                    { y: 30, opacity: 0, letterSpacing: '20px' },
                    { y: 0, opacity: 1, letterSpacing: '8px', duration: 1, ease: 'power4.out' }
                )
                    .fromTo(titleChars,
                        { y: 120, opacity: 0, rotateX: -100, transformOrigin: '50% 0%' },
                        {
                            y: 0,
                            opacity: 1,
                            rotateX: 0,
                            duration: 1.5,
                            stagger: 0.04,
                            ease: 'expo.out'
                        },
                        '-=0.7'
                    )
                    .fromTo(subtitle,
                        { x: -50, opacity: 0, filter: 'blur(10px)' },
                        { x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
                        '-=1'
                    )
                    .fromTo(desc,
                        { y: 40, opacity: 0 },
                        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
                        '-=1'
                    )
                    .fromTo(section.querySelector('.collab-more-btn'),
                        { x: -30, opacity: 0 },
                        { x: 0, opacity: 1, duration: 1, ease: 'power4.out' },
                        '-=0.8'
                    );
            });

        }, containerRef);

        return () => ctx.revert();
    }, [collabData.length]);

    const splitText = (text) => {
        if (!text) return null;
        return text.split('').map((char, index) => (
            <span key={index} className="title-char" style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
                {char}
            </span>
        ));
    };

    return (
        <div className="collaboration-page" ref={containerRef}>
            <div className="collab-sections-wrapper">
                {collabData.map((collab, index) => (
                    <section
                        key={collab.id}
                        className="collab-hero-section"
                        ref={el => sectionsRef.current[index] = el}
                    >
                        <div className="collab-bg-layer">
                            <img src={collab.image} alt={collab.title} className="collab-bg-image" />
                            <div className="bg-overlay"></div>
                        </div>

                        <div className="collab-content-layer">
                            <div className="content-left">
                                <span className="collab-label-tag">{collab.label}</span>
                                <h1 className="collab-hero-title">
                                    {splitText(collab.title)}
                                </h1>
                                <p className="collab-hero-subtitle">{collab.subtitle}</p>
                            </div>

                            <div className="content-right">
                                <p className="collab-hero-desc">{collab.desc}</p>
                            </div>
                        </div>

                        <div className="collab-bottom-ui">
                            <div className="collab-scroll-hint">
                                <span className="hint-text">0{index + 1}</span>
                                <div className="hint-line"></div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default Collaboration;
