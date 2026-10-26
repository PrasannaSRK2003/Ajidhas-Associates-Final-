import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IoArrowBack, IoLocationOutline, IoCalendarOutline, IoPersonOutline } from 'react-icons/io5';
import './ArchitectureProjectDetail.css';

import villaLumiere from '../../assets/villa_lumiere.png';
import villaSolenne from '../../assets/villa_solenne.png';
import bg3 from '../../assets/home_bg.png';
import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

gsap.registerPlugin(ScrollTrigger);

const projectData = {
    1: {
        title: 'Villa Lumière',
        location: 'Provence, France',
        year: '2025',
        designer: 'Jean-Pierre Lefèvre',
        coords: '43.7031° N, 5.4500° E',
        description: 'A secluded villa surrounded by vineyards and olive trees. Expansive windows, natural textures, and a horizon that never ends. The architecture focuses on the play of light throughout the day, creating a living canvas of shadows and highlights.',
        mainImage: villaLumiere,
        gallery: [villaLumiere, art1, art2, art3]
    },
    2: {
        title: 'Villa Solenne',
        location: 'Côte d\'Azur, France',
        year: '2025',
        designer: 'Claire Moreau',
        coords: '43.5528° N, 7.0174° E',
        description: 'A coastal villa where the sea and sky merge. Terraces bathed in Mediterranean light, serene interiors, and the calm of endless horizons. The structure uses local stone and modern glass to create a timeless dialogue with the rugged coastline.',
        mainImage: villaSolenne,
        gallery: [villaSolenne, art3, art2, art1]
    },
    3: {
        title: 'Urban Monolith',
        location: 'Berlin, Germany',
        year: '2024',
        designer: 'Marco Bianchi',
        coords: '52.5200° N, 13.4050° E',
        description: 'A striking commercial space in the heart of the city. Brutalist geometry meets modern functionality, creating a landmark of contemporary design. The interior features raw concrete finishes contrasted with warm wood accents.',
        mainImage: bg3,
        gallery: [bg3, art2, art1, art3]
    }
};

const ArchitectureProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const project = projectData[id] || projectData[1];

    const containerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.fromTo('.arch-detail-hero-content > *',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out' }
        );

        tl.fromTo('.arch-detail-hero-image',
            { scale: 1.1, filter: 'brightness(0)' },
            { scale: 1, filter: 'brightness(0.7)', duration: 2, ease: 'power2.out' },
            '-=1.5'
        );

        // Scroll animations for sections
        gsap.fromTo('.arch-detail-info-section',
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.arch-detail-info-section',
                    start: 'top 85%',
                }
            }
        );

        gsap.fromTo('.arch-detail-gallery-item',
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.arch-detail-gallery-grid',
                    start: 'top 85%',
                }
            }
        );

        }, containerRef);

        return () => ctx.revert();
    }, [id]);

    return (
        <div className="arch-project-detail-container" ref={containerRef}>
            <button className="back-btn-prof detail-back" onClick={() => navigate('/architecture/all-work')}>
                <div className="arrow-circle">
                    <IoArrowBack />
                </div>
            </button>

            <section className="arch-detail-hero">
                <div className="arch-detail-hero-image">
                    <img src={project.mainImage} alt={project.title} />
                </div>
                <div className="arch-detail-hero-content">
                    <p className="arch-detail-coords">{project.coords}</p>
                    <h1 className="arch-detail-title">{project.title}</h1>
                    <div className="arch-detail-quick-meta">
                        <span>{project.location}</span>
                        <span className="separator">•</span>
                        <span>{project.year}</span>
                    </div>
                </div>
            </section>

            <section className="arch-detail-info-section">
                <div className="arch-detail-info-grid">
                    <div className="arch-detail-description">
                        <h2>The Vision</h2>
                        <p>{project.description}</p>
                    </div>
                    <div className="arch-detail-specs">
                        <div className="spec-item">
                            <IoLocationOutline />
                            <div>
                                <span>Location</span>
                                <p>{project.location}</p>
                            </div>
                        </div>
                        <div className="spec-item">
                            <IoCalendarOutline />
                            <div>
                                <span>Year</span>
                                <p>{project.year}</p>
                            </div>
                        </div>
                        <div className="spec-item">
                            <IoPersonOutline />
                            <div>
                                <span>Lead Designer</span>
                                <p>{project.designer}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="arch-detail-gallery">
                <div className="section-header">
                    <span className="section-number">01</span>
                    <h2 className="section-title">Visual Study</h2>
                    <div className="section-line"></div>
                </div>
                <div className="arch-detail-gallery-grid">
                    {project.gallery.map((img, index) => (
                        <div key={index} className="arch-detail-gallery-item">
                            <img src={img} alt={`${project.title} detail ${index}`} />
                        </div>
                    ))}
                </div>
            </section>

            <footer className="arch-detail-footer">
                <div className="footer-content">
                    <p>Next Project</p>
                    <h2 onClick={() => navigate(`/architecture/project/${(parseInt(id) % 3) + 1}`)}>
                        {projectData[(parseInt(id) % 3) + 1].title}
                    </h2>
                </div>
            </footer>
        </div>
    );
};

export default ArchitectureProjectDetail;
