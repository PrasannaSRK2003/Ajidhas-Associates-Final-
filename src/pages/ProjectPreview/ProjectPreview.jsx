import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoAddOutline } from 'react-icons/io5';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './ProjectPreview.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

const defaultProjectImages = {
    1: [art1, art2, art3, art1, art2, art3, art1, art2],
    2: [art2, art3, art1, art2, art3, art1, art2, art3],
    3: [art3, art1, art2, art3, art1, art2, art3, art1],
    4: [art1, art2, art3, art1, art2, art3, art1, art2],
    5: [art2, art3, art1, art2, art3, art1, art2, art3],
    6: [art3, art1, art2, art3, art1, art2, art3, art1]
};

const defaultProjectData = {
    1: { title: 'Ethereal Silence', category: 'Series 01', year: '2025' },
    2: { title: 'Bronze Form No. 4', category: 'Series 02', year: '2024' },
    3: { title: 'Monolith', category: 'Series 03', year: '2025' },
    4: { title: 'Urban Echo', category: 'Series 04', year: '2024' },
    5: { title: 'Shadow Play', category: 'Series 05', year: '2025' },
    6: { title: 'Geometric Void', category: 'Series 06', year: '2025' }
};

const ProjectPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { wpContent, wpProjects, getText } = useContent();

    // 1. Resolve Dynamic Project Info from WP CRM or Fallback
    const resolvedProject = (() => {
        const previewItems = wpContent?.project_preview?.items || wpContent?.project_preview?.projects;
        if (Array.isArray(previewItems) && previewItems.length > 0) {
            const found = previewItems.find(p => String(p.id) === String(id)) || previewItems[parseInt(id) - 1];
            if (found) {
                return {
                    title: found.title || defaultProjectData[id]?.title || `Project ${id}`,
                    category: found.category || found.label || defaultProjectData[id]?.category || `Series 0${id}`,
                    year: found.year || defaultProjectData[id]?.year || '2025',
                    images: found.images || [found.image1, found.image2, found.image3].filter(Boolean)
                };
            }
        }

        if (Array.isArray(wpProjects) && wpProjects.length > 0) {
            const wpProj = wpProjects.find(p => String(p.id) === String(id)) || wpProjects[parseInt(id) - 1];
            if (wpProj) {
                return {
                    title: wpProj.title?.rendered || wpProj.title || defaultProjectData[id]?.title,
                    category: wpProj.category || wpProj.project_type || defaultProjectData[id]?.category || 'Series 01',
                    year: wpProj.year || '2025',
                    images: wpProj.gallery || (wpProj.featured_image ? [wpProj.featured_image] : null)
                };
            }
        }

        const galleryItems = wpContent?.gallery?.items || wpContent?.art?.items;
        if (Array.isArray(galleryItems) && galleryItems.length > 0) {
            const item = galleryItems[parseInt(id) - 1] || galleryItems[0];
            if (item) {
                return {
                    title: item.title || defaultProjectData[id]?.title,
                    category: item.label || item.category || defaultProjectData[id]?.category || `Series 0${id}`,
                    year: item.year || defaultProjectData[id]?.year || '2025',
                    images: item.image ? [item.image] : null
                };
            }
        }

        return defaultProjectData[id] || defaultProjectData[1];
    })();

    // 2. Resolve Dynamic Project Images array for 3D Ring
    const images = (() => {
        const defaultImgs = defaultProjectImages[id] || defaultProjectImages[1];
        if (resolvedProject?.images && Array.isArray(resolvedProject.images) && resolvedProject.images.length > 0) {
            const customImgs = resolvedProject.images.filter(img => typeof img === 'string' && img.trim() !== '');
            if (customImgs.length > 0) {
                const ringImgs = [];
                for (let i = 0; i < 8; i++) {
                    ringImgs.push(customImgs[i % customImgs.length]);
                }
                return ringImgs;
            }
        }
        return defaultImgs;
    })();

    const project = resolvedProject;

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const requestRef = useRef();
    const cardRefs = useRef([]);
    const backgroundRefs = useRef([]);
    const rotationRef = useRef(0);
    const isPausedRef = useRef(false);
    const hoveredIndexRef = useRef(null);
    const activeIndexRef = useRef(0);
    const applyRotationRef = useRef(() => {});

    const total = images.length;
    const angleStep = 360 / total;

    useEffect(() => {
        window.scrollTo(0, 0);

        rotationRef.current = 0;
        activeIndexRef.current = 0;

        const applyRotation = () => {
            const rotation = rotationRef.current;
            const normalizedRotation = ((-rotation % 360) + 360) % 360;
            const nextActiveIndex = Math.round(normalizedRotation / angleStep) % total;

            if (nextActiveIndex !== activeIndexRef.current) {
                activeIndexRef.current = nextActiveIndex;
                setActiveIndex(nextActiveIndex);
            }

            backgroundRefs.current.forEach((background, index) => {
                background?.classList.toggle('active', index === nextActiveIndex);
            });

            cardRefs.current.forEach((card, index) => {
                if (!card) return;

                if (hoveredIndexRef.current === index) {
                    gsap.set(card, {
                        x: 0,
                        z: 600,
                        scale: 1.1,
                        rotationY: 0,
                        zIndex: 2000,
                        opacity: 1,
                        filter: 'blur(0px)',
                    });
                    return;
                }

                const currentAngle = (angleStep * index + rotation) % 360;
                const angleRad = (currentAngle * Math.PI) / 180;
                const radiusX = window.innerWidth > 1200 ? 500 : (window.innerWidth > 768 ? 400 : 250);
                const radiusZ = 500;
                const x = Math.sin(angleRad) * radiusX;
                const z = Math.cos(angleRad) * radiusZ;
                const normalizedZ = (z + radiusZ) / (2 * radiusZ);

                gsap.set(card, {
                    x,
                    z,
                    scale: normalizedZ * 0.6 + 0.4,
                    rotationY: -Math.sin(angleRad) * 20,
                    zIndex: Math.round(z + radiusZ),
                    opacity: normalizedZ * 0.8 + 0.2,
                    filter: `blur(${(1 - normalizedZ) * 6}px)`,
                });
            });
        };
        applyRotationRef.current = applyRotation;

        const animate = () => {
            if (!isPausedRef.current) {
                rotationRef.current -= 0.15;
                applyRotation();
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        applyRotation();
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [angleStep, id, total]);

    const studioName = getText('general', 'site_title', 'AJIDHAS ASSOCIATES');

    return (
        <div className="project-preview-container circular-layout">
            {/* Dynamic Blurred Background */}
            <div className="preview-dynamic-bg">
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`bg-image-layer ${activeIndex === index ? 'active' : ''}`}
                        ref={el => { backgroundRefs.current[index] = el; }}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                <div className="bg-overlay-dark"></div>
            </div>

            <header className="preview-header">
                <div className="header-info">
                    <span className="category">{project.category}</span>
                    <h1 className="title">{project.title}</h1>
                </div>
            </header>

            <div className="preview-circular-viewport">
                <div className="nav-indicator left">
                    <div className="cross-icon"><IoAddOutline /></div>
                </div>

                <div className="cards-ring">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`preview-card-3d ${hoveredIndex === index ? 'hovered' : ''}`}
                            ref={el => { cardRefs.current[index] = el; }}
                            onMouseEnter={() => {
                                isPausedRef.current = true;
                                hoveredIndexRef.current = index;
                                setHoveredIndex(index);
                                applyRotationRef.current();
                            }}
                            onMouseLeave={() => {
                                isPausedRef.current = false;
                                hoveredIndexRef.current = null;
                                setHoveredIndex(null);
                                applyRotationRef.current();
                            }}
                            onClick={() => navigate(`/art/project/${id}`)}
                        >
                            <div className="card-inner">
                                <img src={img} alt={`${project.title} ${index}`} />
                                <div className="card-overlay">
                                    <div className="card-info">
                                        <span className="card-index">0{index + 1}</span>
                                        <h3 className="card-title">{project.title}</h3>
                                        <p className="view-text">Explore Project</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="nav-indicator right">
                    <div className="cross-icon"><IoAddOutline /></div>
                </div>
            </div>

            <footer className="preview-footer">
                <div className="footer-meta">
                    <span>{project.year} {studioName}</span>
                </div>
            </footer>
        </div>
    );
};

export default ProjectPreview;
