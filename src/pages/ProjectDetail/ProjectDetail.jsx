import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IoArrowBack, IoMailOutline } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './ProjectDetail.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

gsap.registerPlugin(ScrollTrigger);

const defaultProjectData = {
    1: {
        title: 'Ethereal Silence',
        category: 'Series 01',
        year: '2025',
        artist: 'Ajidhas',
        description: 'An exploration of texture and void, capturing the silence of abandoned spaces. This series delves into the relationship between light and shadow in architectural remains.',
        mainImage: art1,
        gallery: [art1, art2, art3, art1, art2]
    },
    2: {
        title: 'Bronze Form No. 4',
        category: 'Series 02',
        year: '2024',
        artist: 'Ajidhas',
        description: 'A study in weight and balance, casting dramatic shadows that change with the light. The sculpture interacts with its environment, creating a dialogue between form and space.',
        mainImage: art2,
        gallery: [art2, art3, art1, art2, art3]
    },
    3: {
        title: 'Monolith',
        category: 'Series 03',
        year: '2025',
        artist: 'Ajidhas',
        description: 'High contrast architectural photography focusing on brutalist geometry. The series highlights the raw power of concrete and the precision of modern design.',
        mainImage: art3,
        gallery: [art3, art1, art2, art3, art1]
    }
};

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { wpContent, wpProjects, getText } = useContent();

    // 1. Dynamic Project Resolution
    const resolvedProject = (() => {
        const defaultProj = defaultProjectData[id] || defaultProjectData[1];

        // A. Check wpContent.project_detail.projects
        const detailItems = wpContent?.project_detail?.projects || wpContent?.project_detail?.items;
        if (Array.isArray(detailItems) && detailItems.length > 0) {
            const found = detailItems.find(p => String(p.id) === String(id)) || detailItems[parseInt(id) - 1];
            if (found) {
                const mainImg = found.main_image || found.mainImage || found.image || defaultProj.mainImage;
                const rawGallery = Array.isArray(found.gallery) && found.gallery.length > 0
                    ? found.gallery.filter(g => typeof g === 'string' && g.trim() !== '')
                    : [mainImg, ...defaultProj.gallery];
                return {
                    title: found.title || defaultProj.title,
                    category: found.category || found.label || defaultProj.category,
                    year: found.year || defaultProj.year,
                    artist: found.artist || getText('art', 'artist_name', defaultProj.artist),
                    description: found.description || found.desc || defaultProj.description,
                    mainImage: mainImg,
                    gallery: rawGallery.length > 0 ? rawGallery : defaultProj.gallery
                };
            }
        }

        // B. Check wpContent.project_preview.projects
        const previewItems = wpContent?.project_preview?.projects || wpContent?.project_preview?.items;
        if (Array.isArray(previewItems) && previewItems.length > 0) {
            const found = previewItems.find(p => String(p.id) === String(id)) || previewItems[parseInt(id) - 1];
            if (found) {
                const mainImg = found.image || found.image1 || defaultProj.mainImage;
                return {
                    title: found.title || defaultProj.title,
                    category: found.category || defaultProj.category,
                    year: found.year || defaultProj.year,
                    artist: getText('art', 'artist_name', defaultProj.artist),
                    description: found.desc || found.description || defaultProj.description,
                    mainImage: mainImg,
                    gallery: [mainImg, ...defaultProj.gallery]
                };
            }
        }

        // C. Check wpProjects (WP custom post types)
        if (Array.isArray(wpProjects) && wpProjects.length > 0) {
            const wpProj = wpProjects.find(p => String(p.id) === String(id)) || wpProjects[parseInt(id) - 1];
            if (wpProj) {
                const mainImg = wpProj.featured_image || defaultProj.mainImage;
                return {
                    title: wpProj.title?.rendered || wpProj.title || defaultProj.title,
                    category: wpProj.category || defaultProj.category,
                    year: wpProj.year || defaultProj.year,
                    artist: wpProj.artist || getText('art', 'artist_name', defaultProj.artist),
                    description: wpProj.excerpt?.rendered || wpProj.content?.rendered || defaultProj.description,
                    mainImage: mainImg,
                    gallery: Array.isArray(wpProj.gallery) && wpProj.gallery.length > 0 ? wpProj.gallery : defaultProj.gallery
                };
            }
        }

        return defaultProj;
    })();

    const project = resolvedProject;
    const contactEmail = getText('general', 'contact_email', 'ajidhas@gmail.com');

    const heroRef = useRef(null);
    const galleryRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            tl.fromTo('.hero-content > *',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' }
            );

            tl.fromTo('.hero-image-container',
                { scale: 1.1, opacity: 0 },
                { scale: 1, opacity: 1, duration: 1.5, ease: 'power3.out' },
                '-=1'
            );

            // Gallery animations
            gsap.fromTo('.gallery-section-title',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    scrollTrigger: {
                        trigger: '.gallery-section',
                        start: 'top 80%',
                    }
                }
            );

            gsap.fromTo('.gallery-grid-item',
                { y: 100, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: '.gallery-grid-detail',
                        start: 'top 80%',
                    }
                }
            );

        }, containerRef);

        return () => ctx.revert();
    }, [id]);

    return (
        <div className="project-detail-page" ref={containerRef}>
            <div className="detail-dynamic-bg" style={{ backgroundImage: `url(${project.mainImage})` }}>
                <div className="bg-overlay-dark"></div>
            </div>

            <section className="project-hero" ref={heroRef}>
                <div className="hero-content">
                    <span className="project-category">{project.category}</span>
                    <h1 className="project-title">{project.title}</h1>
                    <div className="project-meta">
                        <div className="meta-item">
                            <span>Artist</span>
                            <p>{project.artist}</p>
                        </div>
                        <div className="meta-item">
                            <span>Year</span>
                            <p>{project.year}</p>
                        </div>
                    </div>
                    <p className="project-description">{project.description}</p>
                    <div className="project-actions">
                        <a href={`mailto:${contactEmail}`} className="inquire-link">
                            <IoMailOutline />
                            <span>Inquire about this series</span>
                        </a>
                        <button className="contact-project-btn" onClick={() => navigate('/architecture/contact')}>
                            Contact Us
                        </button>
                    </div>
                </div>
                <div className="hero-image-container">
                    <img src={project.mainImage} alt={project.title} />
                </div>
            </section>

            <section className="gallery-section" ref={galleryRef}>
                <div className="gallery-section-header">
                    <h2 className="gallery-section-title">Series Gallery</h2>
                    <div className="section-line"></div>
                </div>

                <div className="gallery-grid-detail">
                    {project.gallery.map((img, index) => (
                        <div key={index} className={`gallery-grid-item item-${index % 3}`}>
                            <img src={img} alt={`${project.title} - ${index}`} />
                        </div>
                    ))}
                </div>
            </section>

            <footer className="project-footer">
                <button className="next-project-btn" onClick={() => navigate(`/art/project/${(parseInt(id) % 3) + 1}`)}>
                    <span>Next Project</span>
                    <IoArrowBack style={{ transform: 'rotate(180deg)' }} />
                </button>
            </footer>
        </div>
    );
};

export default ProjectDetail;
