import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import './About.css';

import team1 from '../../assets/team_1.png';
import team2 from '../../assets/team_2.png';
import team3 from '../../assets/team_3.png';
import team4 from '../../assets/team_4.png';

import { useContent } from '../../context/useContent';

const defaultTeamMembers = [
    {
        id: 1,
        name: "Ajidhas",
        role: "Principal Architect",
        image: team1,
        bio: "A visionary leader with over 15 years of experience in sustainable urban design. Ajidhas leads the studio with a commitment to harmonizing modern architecture with the natural environment, creating spaces that inspire and endure."
    },
    {
        id: 2,
        name: "Pradeep",
        role: "Creative Director",
        image: team2,
        bio: "Pradeep brings a unique artistic perspective to every project. His expertise in spatial storytelling and material innovation ensures that each design is not just a building, but a visually poetic experience."
    },
    {
        id: 3,
        name: "Sarah Chen",
        role: "Lead Designer",
        image: team3,
        bio: "Sarah specializes in minimalist residential architecture. Her work is characterized by clean lines, functional elegance, and a deep understanding of how light transforms interior spaces."
    },
    {
        id: 4,
        name: "Marcus Vane",
        role: "Technical Lead",
        image: team4,
        bio: "Marcus bridges the gap between complex engineering and architectural beauty. He ensures that our most ambitious designs are structurally sound and technologically advanced."
    }
];

const About = () => {
    const { getTeam, getText } = useContent();
    const teamMembers = getTeam ? getTeam(defaultTeamMembers) : defaultTeamMembers;
    const studioDesc = getText ? getText('about', 'studio_description', 'A collective of visionary architects, designers, and artists crafting timeless environments.') : 'A collective of visionary architects, designers, and artists crafting timeless environments.';

    const [activeIndex, setActiveIndex] = useState(0);
    const activeIndexRef = useRef(0);
    const containerRef = useRef(null);
    const cardRefs = useRef([]);
    const rotationRef = useRef(0);
    const isPausedRef = useRef(false);
    const requestRef = useRef();

    const teamMembersList = Array.isArray(teamMembers) && teamMembers.length > 0 ? teamMembers : defaultTeamMembers;
    const total = teamMembersList.length;
    const angleStep = 360 / (total || 1);

    const activeMember = teamMembersList[activeIndex] || teamMembersList[0] || defaultTeamMembers[0];
    const firstName = (activeMember?.name || 'Ajidhas').split(' ')[0];

    const touchStartX = useRef(0);
    const touchDragRef = useRef(false);

    useEffect(() => {
        const applyRotation = () => {
            const rotation = rotationRef.current;
            if (!cardRefs.current) return;

            let maxZ = -Infinity;
            let frontCardIndex = 0;

            const width = window.innerWidth;
            const isMobile = width <= 768;
            const isSmallMobile = width <= 480;
            const isTablet = width > 768 && width <= 1024;

            const radiusX = isSmallMobile ? 95 : (isMobile ? 130 : (isTablet ? 220 : 350));
            const radiusZ = isSmallMobile ? 140 : (isMobile ? 190 : (isTablet ? 280 : 400));

            cardRefs.current.forEach((card, cardIndex) => {
                if (!card) return;

                const currentAngle = (angleStep * cardIndex + rotation) % 360;
                const angleRad = (currentAngle * Math.PI) / 180;
                const x = Math.sin(angleRad) * radiusX;
                const z = Math.cos(angleRad) * radiusZ;
                const normalizedZ = (z + radiusZ) / (2 * radiusZ);

                if (z > maxZ) {
                    maxZ = z;
                    frontCardIndex = cardIndex;
                }

                try {
                    gsap.set(card, {
                        x,
                        z,
                        scale: normalizedZ * (isMobile ? 0.35 : 0.5) + (isMobile ? 0.65 : 0.5),
                        rotationY: -Math.sin(angleRad) * (isMobile ? 16 : 30),
                        zIndex: Math.round(z + radiusZ),
                        opacity: normalizedZ * 0.75 + 0.25,
                        filter: `blur(${(1 - normalizedZ) * (isMobile ? 3 : 8)}px)`,
                    });
                } catch {
                    // Keep the animation loop running if GSAP cannot update a card.
                }
            });

            if (frontCardIndex !== activeIndexRef.current) {
                activeIndexRef.current = frontCardIndex;
                setActiveIndex(frontCardIndex);
            }
        };

        const animate = () => {
            if (!isPausedRef.current) {
                rotationRef.current -= 0.15;
            }
            applyRotation();
            requestRef.current = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            applyRotation();
        };

        window.addEventListener('resize', handleResize);
        applyRotation();
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [angleStep, total]);

    // Touch gesture handlers for smooth mobile interactive swipe
    const handleTouchStart = (e) => {
        if (e.touches && e.touches[0]) {
            touchStartX.current = e.touches[0].clientX;
            touchDragRef.current = true;
            isPausedRef.current = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!touchDragRef.current || !e.touches || !e.touches[0]) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX.current;
        rotationRef.current += diffX * 0.4;
        touchStartX.current = currentX;
    };

    const handleTouchEnd = () => {
        touchDragRef.current = false;
        isPausedRef.current = false;
    };

    // Entrance animation
    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".about-v2-left",
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
            gsap.fromTo(".about-v2-right",
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Text transition animation on active member change
    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".member-info-content",
                { opacity: 0.3, y: 10, filter: 'blur(4px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }
            );
            gsap.fromTo(".bg-text-overlay span",
                { opacity: 0, scale: 0.9 },
                { opacity: 0.03, scale: 1, duration: 0.6, ease: 'power2.out' }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [activeIndex]);

    const handleNext = () => {
        rotationRef.current -= angleStep;
    };

    const handlePrev = () => {
        rotationRef.current += angleStep;
    };

    return (
        <div
            className="about-v2-container"
            ref={containerRef}
            onMouseEnter={() => { isPausedRef.current = true; }}
            onMouseLeave={() => { isPausedRef.current = false; }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="about-v2-content">
                {/* Left Side: Dynamic Details synchronized with front 3D card */}
                <div className="about-v2-left">
                    <div className="member-info-content">
                        <span className="member-role-tag">{activeMember?.role || 'Architect'}</span>
                        <h1 className="member-name-title">{activeMember?.name || 'Team Member'}</h1>
                        <div className="member-bio-container">
                            <p className="member-bio-text">{activeMember?.bio || studioDesc}</p>
                        </div>

                        <div className="member-nav-controls">
                            <button className="nav-btn prev" onClick={handlePrev} aria-label="Previous Team Member">
                                <IoChevronBackOutline />
                            </button>
                            <div className="nav-counter">
                                <span className="current">{(activeIndex + 1).toString().padStart(2, '0')}</span>
                                <span className="separator">/</span>
                                <span className="total">{total.toString().padStart(2, '0')}</span>
                            </div>
                            <button className="nav-btn next" onClick={handleNext} aria-label="Next Team Member">
                                <IoChevronForwardOutline />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: 3D Ring with 3D Position Sync */}
                <div className="about-v2-right">
                    <div className="team-circular-ring">
                        {teamMembersList.map((member, index) => {
                            const memberImg = member.image || defaultTeamMembers[index]?.image || team1;
                            return (
                                <div
                                    key={member.id || index}
                                    className={`team-member-card-3d ${activeIndex === index ? 'active' : ''}`}
                                    ref={el => { cardRefs.current[index] = el; }}
                                    onClick={() => {
                                        rotationRef.current = -index * angleStep;
                                    }}
                                >
                                    <div className="member-image-wrapper">
                                        <img src={memberImg} alt={member.name || 'Team'} className="member-main-img" />
                                        <div className="image-overlay-gradient"></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Background Decorative Text Watermark */}
                    <div className="bg-text-overlay">
                        <span>{firstName}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Progress Bar Sync */}
            <div className="about-progress-container">
                {teamMembersList.map((_, i) => (
                    <div
                        key={i}
                        className={`progress-dot ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => {
                            rotationRef.current = -i * angleStep;
                        }}
                    >
                        <div className="progress-fill"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default About;
