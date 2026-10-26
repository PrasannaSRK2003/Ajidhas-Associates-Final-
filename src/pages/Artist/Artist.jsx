import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../../context/useContent';
import './Artist.css';
import artistImg from '../../assets/artist_new_profile.png';

gsap.registerPlugin(ScrollTrigger);

const Artist = () => {
    const { getText, getImage } = useContent();

    const sectionRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);
    const containerRef = useRef(null);
    const statsRef = useRef(null);

    const overlayFirstname = getText('art', 'overlay_firstname', 'Artist');
    const overlayLastname = getText('art', 'overlay_lastname', 'Ajidhas');
    const sectionLabel = getText('art', 'section_label', 'Visionary Creator');
    const sectionTitle = getText('art', 'section_title', 'About Artist');
    const artistName = getText('art', 'artist_name', 'Ajidhas');
    const artistBio = getText('art', 'artist_bio', 'Jeeshnu Ajidhas is an emerging artist with a deep-seated passion for art, which is vividly reflected in his work. His creations are not merely visual experiences but emotional expressions, capturing intricate feelings through his adept use of rich tones. He imbues his subjects with a striking physical presence, making his art both captivating and impactful.');
    const artistPhilosophy = getText('art', 'artist_philosophy', '"My art is an extension of my architectural practice—a search for balance in a world of chaos. Every stroke and every line is a step towards understanding the essence of our surroundings."');

    const profilePhoto = getImage('art', 'artist_image', artistImg);

    const stat1Val = getText('art', 'stat_1_val', '10');
    const stat1Label = getText('art', 'stat_1_label', 'Exhibitions');
    const stat2Val = getText('art', 'stat_2_val', '50');
    const stat2Label = getText('art', 'stat_2_label', 'Artworks');
    const stat3Val = getText('art', 'stat_3_val', '15');
    const stat3Label = getText('art', 'stat_3_label', 'Awards');

    useEffect(() => {
        let handleMouseMove;
        const ctx = gsap.context(() => {
            if (!sectionRef.current) return;

            // Entrance Animation
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                }
            });

            if (imageRef.current) {
                tl.fromTo(imageRef.current,
                    { scale: 1.2, opacity: 0, rotateY: -20 },
                    { scale: 1, opacity: 1, rotateY: 0, duration: 1.8, ease: 'expo.out' }
                );
            }

            const profileImgEl = containerRef.current?.querySelector('.artist-profile-img');
            if (profileImgEl) {
                tl.fromTo(profileImgEl,
                    { scale: 1.5 },
                    { scale: 1, duration: 2.5, ease: 'expo.out' },
                    '<'
                );
            }

            const floatShapes = containerRef.current?.querySelectorAll('.floating-shape');
            if (floatShapes && floatShapes.length > 0) {
                tl.fromTo(floatShapes,
                    { scale: 0, opacity: 0 },
                    { scale: 1, opacity: 0.1, duration: 1, stagger: 0.2, ease: 'back.out(1.7)' },
                    '-=1.5'
                );
            }

            if (textRef.current && textRef.current.children.length > 0) {
                tl.fromTo(textRef.current.children,
                    { y: 40, opacity: 0, skewY: 2 },
                    { y: 0, opacity: 1, skewY: 0, duration: 1, stagger: 0.1, ease: 'power4.out' },
                    '-=1.2'
                );
            }

            // Stats Counter Animation
            if (statsRef.current) {
                const statsItems = statsRef.current.querySelectorAll('.stat-number');
                statsItems.forEach(stat => {
                    const rawVal = stat.getAttribute('data-value');
                    const targetValue = parseInt(rawVal, 10) || 10;
                    gsap.fromTo(stat,
                        { innerText: 0 },
                        {
                            innerText: targetValue,
                            duration: 2,
                            snap: { innerText: 1 },
                            scrollTrigger: {
                                trigger: stat,
                                start: 'top 90%',
                            },
                            onUpdate: function () {
                                if (stat) {
                                    stat.innerText = Math.ceil(this.targets()[0].innerText) + '+';
                                }
                            }
                        }
                    );
                });
            }

            // Mouse Move Parallax
            handleMouseMove = (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 40;
                const yPos = (clientY / window.innerHeight - 0.5) * 40;

                if (imageRef.current) {
                    gsap.to(imageRef.current, {
                        x: xPos * 0.5,
                        y: yPos * 0.5,
                        rotateY: xPos * 0.1,
                        rotateX: -yPos * 0.1,
                        duration: 1,
                        ease: 'power2.out'
                    });
                }

                const shape1 = containerRef.current?.querySelector('.floating-shape-1');
                if (shape1) {
                    gsap.to(shape1, {
                        x: -xPos * 1.5,
                        y: -yPos * 1.5,
                        duration: 1.5,
                        ease: 'power2.out'
                    });
                }

                const shape2 = containerRef.current?.querySelector('.floating-shape-2');
                if (shape2) {
                    gsap.to(shape2, {
                        x: xPos * 2,
                        y: yPos * 2,
                        duration: 2,
                        ease: 'power2.out'
                    });
                }
            };

            window.addEventListener('mousemove', handleMouseMove);

            // Scroll Parallax for Profile Image
            if (profileImgEl && sectionRef.current) {
                gsap.to(profileImgEl, {
                    yPercent: 15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

        }, containerRef);

        return () => {
            if (handleMouseMove) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
            ctx.revert();
        };
    }, []);

    return (
        <div className="artist-page" ref={containerRef}>
            {/* Decorative Background Elements */}
            <div className="floating-shape floating-shape-1"></div>
            <div className="floating-shape floating-shape-2"></div>
            <div className="bg-glow"></div>

            <section className="about-artist-section" ref={sectionRef}>
                <div className="container">
                    <div className="artist-grid">
                        <div className="artist-image-container" ref={imageRef}>
                            <div className="artist-profile-img-wrapper">
                                <img src={profilePhoto} alt={artistName} className="artist-profile-img" />
                                <div className="image-overlay"></div>
                                <div className="artist-name-overlay">
                                    <span className="overlay-firstname">{overlayFirstname}</span>
                                    <span className="overlay-lastname">{overlayLastname}</span>
                                </div>
                            </div>
                            <div className="image-frame-decoration"></div>
                        </div>

                        <div className="artist-details" ref={textRef}>
                            <div className="label-wrapper">
                                <span className="section-label">{sectionLabel}</span>
                                <div className="label-line"></div>
                            </div>

                            <h2 className="section-title">{sectionTitle}</h2>
                            <h3 className="artist-name">{artistName}</h3>

                            <div className="bio-wrapper">
                                <p className="artist-bio">{artistBio}</p>
                            </div>

                            <div className="philosophy-card">
                                <p className="artist-philosophy">{artistPhilosophy}</p>
                            </div>

                            <div className="artist-stats" ref={statsRef}>
                                <div className="stat-item">
                                    <span className="stat-number" data-value={stat1Val}>0+</span>
                                    <span className="stat-label">{stat1Label}</span>
                                    <div className="stat-bar"></div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-value={stat2Val}>0+</span>
                                    <span className="stat-label">{stat2Label}</span>
                                    <div className="stat-bar"></div>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number" data-value={stat3Val}>0+</span>
                                    <span className="stat-label">{stat3Label}</span>
                                    <div className="stat-bar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Artist;
