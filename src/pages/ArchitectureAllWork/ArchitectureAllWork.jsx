import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './ArchitectureAllWork.css';

import bg1 from '../../assets/hero_bg_night.png';
import bg2 from '../../assets/hero_bg_architecture.png';
import bg3 from '../../assets/home_bg.png';
import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

const defaultAllProjects = [
    { id: 1, image: bg1, title: 'The Nexus Tower', desc: 'A vertical city within a city, redefining urban living with sustainable innovation.', location: 'Europe', year: '2024', status: 'Completed', type: 'Commercial' },
    { id: 2, image: bg2, title: 'Horizon House', desc: 'Where earth meets sky. A cantilevered masterpiece suspended over the valley.', location: 'Asia', year: '2024', status: 'Completed', type: 'Residential' },
    { id: 3, image: bg3, title: 'Aqua Residence', desc: 'Fluid architecture inspired by water. Curves and reflections create a living sculpture.', location: 'Americas', year: '2025', status: 'In Design', type: 'Residential' },
    { id: 4, image: art1, title: 'The Void Gallery', desc: 'Negative space becomes the artwork. A museum that celebrates emptiness.', location: 'Europe', year: '2023', status: 'Completed', type: 'Cultural' },
    { id: 5, image: art2, title: 'Copper Sanctuary', desc: 'Oxidized metal meets sacred geometry in this meditation retreat.', location: 'Asia', year: '2024', status: 'Completed', type: 'Hospitality' },
    { id: 6, image: art3, title: 'Crystal Pavilion', desc: 'Transparent walls dissolve boundaries between nature and architecture.', location: 'Europe', year: '2025', status: 'Under Construction', type: 'Public' },
    { id: 7, image: bg1, title: 'Midnight Studios', desc: 'Creative spaces bathed in controlled darkness and dramatic light.', location: 'Americas', year: '2024', status: 'Completed', type: 'Studio' },
    { id: 8, image: bg2, title: 'Bamboo Residence', desc: 'Sustainable living through traditional materials and modern design.', location: 'Asia', year: '2023', status: 'Completed', type: 'Residential' },
    { id: 9, image: bg3, title: 'Cliffside Villa', desc: 'Perched on the edge of possibility, embracing the dramatic landscape.', location: 'Europe', year: '2025', status: 'Completed', type: 'Residential' },
    { id: 10, image: art1, title: 'Concrete Poetry', desc: 'Brutalist forms softened by natural light and green terraces.', location: 'Europe', year: '2024', status: 'Completed', type: 'Mixed Use' },
    { id: 11, image: art2, title: 'White Cube Loft', desc: 'Pure minimalism. Every element serves a purpose, nothing more.', location: 'Americas', year: '2023', status: 'Completed', type: 'Residential' },
    { id: 12, image: art3, title: 'Garden Bridge House', desc: 'A living connection between two hillsides, wrapped in vegetation.', location: 'Asia', year: '2025', status: 'In Design', type: 'Residential' },
];

const ArchitectureAllWork = () => {
    const containerRef = useRef(null);
    const timelines = useRef([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const modalImgRef = useRef(null);
    const modalInfoRef = useRef(null);
    const { getText, getImage, wpContent } = useContent();

    const headerTitle = getText('architecture_all', 'header_title', 'ALL WORK');

    const allProjects = (wpContent?.architecture_all?.projects && Array.isArray(wpContent.architecture_all.projects) && wpContent.architecture_all.projects.length > 0)
        ? wpContent.architecture_all.projects.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultAllProjects[idx % defaultAllProjects.length]?.title || `Project ${idx + 1}`,
            desc: item.desc || defaultAllProjects[idx % defaultAllProjects.length]?.desc || '',
            location: item.location || defaultAllProjects[idx % defaultAllProjects.length]?.location || 'Europe',
            year: item.year || defaultAllProjects[idx % defaultAllProjects.length]?.year || '2025',
            status: item.status || defaultAllProjects[idx % defaultAllProjects.length]?.status || 'Completed',
            type: item.type || defaultAllProjects[idx % defaultAllProjects.length]?.type || 'Residential',
            image: item.image || getImage('architecture_all', idx, defaultAllProjects[idx % defaultAllProjects.length]?.image || bg1)
        }))
        : defaultAllProjects.map((item, idx) => ({
            ...item,
            image: getImage('architecture_all', idx, item.image)
        }));

    useEffect(() => {
        timelines.current = [];
        const items = gsap.utils.toArray('.tunnel-item');
        const totalItems = items.length;
        if (totalItems === 0) return;

        const duration = 30;
        const zStart = -totalItems * 800;
        const zEnd = 1500;

        // Mouse Parallax Refs
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            gsap.to('.tunnel-viewport', {
                rotationY: mouseX * 5,
                rotationX: -mouseY * 5,
                duration: 1,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        items.forEach((item, i) => {
            // Random initial offsets for organic feel
            const randomRot = (Math.random() - 0.5) * 20;
            const randomY = (Math.random() - 0.5) * 100;

            gsap.set(item, {
                z: -i * 800 - 500,
                opacity: 0,
                rotationZ: randomRot,
                y: randomY
            });

            const tl = gsap.timeline({
                repeat: -1,
                defaults: { ease: 'none' }
            });

            tl.fromTo(item,
                { z: zStart, opacity: 0, rotationZ: randomRot },
                {
                    z: zEnd,
                    rotationZ: randomRot + (Math.random() * 20 - 10), // Slow rotation
                    duration: duration,
                    onUpdate: function () {
                        const p = this.progress();
                        // Smooth fade in/out
                        if (p < 0.15) gsap.set(item, { opacity: p * 6.6 });
                        else if (p > 0.85) gsap.set(item, { opacity: Math.max(0, 1 - (p - 0.85) * 6.6) });
                        else gsap.set(item, { opacity: 1 });
                    }
                }
            );

            tl.progress(1 - (i / totalItems));
            timelines.current.push(tl);
        });

        // Entrance Animation
        const entranceTl = gsap.timeline();

        entranceTl.fromTo('.aw-char',
            { y: 100, opacity: 0, rotateX: -90 },
            { y: 0, opacity: 1, rotateX: 0, stagger: 0.05, duration: 1, ease: 'power4.out' }
        )
            .fromTo('.aw-subtitle-line',
                { width: 0 },
                { width: '100px', duration: 0.8, ease: 'power2.out' },
                '-=0.5'
            )
            .fromTo('.aw-subtitle',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
                '-=0.6'
            );

        return () => {
            timelines.current.forEach(tl => tl.kill());
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [allProjects.length]);

    const handleProjectClick = (project) => {
        setSelectedProject(project);
    };

    // Animate Modal In
    useEffect(() => {
        if (selectedProject) {
            const tl = gsap.timeline();
            tl.to(modalImgRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.1
            })
                .to(modalInfoRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out'
                }, '-=0.6');
        }
    }, [selectedProject]);

    const handleMouseEnter = () => {
        timelines.current.forEach(tl => gsap.to(tl, { timeScale: 0, duration: 0.5 }));
    };

    const handleMouseLeave = () => {
        timelines.current.forEach(tl => gsap.to(tl, { timeScale: 1, duration: 0.5 }));
    };

    return (
        <div className="all-work-tunnel-container" ref={containerRef}>
            <div className="tunnel-center-text">
                <h1 className="aw-title">
                    {headerTitle.split('').map((char, i) => (
                        <span key={i} className="aw-char" style={{ display: 'inline-block' }}>{char === ' ' ? '\u00A0' : char}</span>
                    ))}
                </h1>
                <div className="aw-subtitle-line"></div>
            </div>

            <div className="tunnel-viewport">
                {allProjects.map((project, index) => (
                    <div
                        key={project.id}
                        className={`tunnel-item item-pos-${index % 12}`}
                    >
                        <div
                            className="tunnel-card"
                            onClick={() => handleProjectClick(project)}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="card-image-wrapper">
                                <img src={project.image} alt={project.title} />
                            </div>
                            <div className="tunnel-card-overlay">
                                <h3 className="tunnel-card-title">{project.title}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Full Screen Modal */}
            <div className={`aw-modal ${selectedProject ? 'active' : ''}`}>
                {selectedProject && (
                    <>
                        <img src={selectedProject.image} alt="bg" className="aw-modal-bg" />
                        <button className="aw-modal-close" onClick={() => setSelectedProject(null)}>✕</button>

                        <div className="aw-modal-content" onClick={(e) => {
                            if (e.target.classList.contains('aw-modal-content')) setSelectedProject(null);
                        }}>
                            <div className="aw-modal-inner">
                                <div className="aw-modal-image-container" ref={modalImgRef}>
                                    <img src={selectedProject.image} alt={selectedProject.title} />
                                </div>
                                <div className="aw-modal-info" ref={modalInfoRef}>
                                    <h2 className="aw-modal-title">{selectedProject.title}</h2>
                                    <p className="aw-modal-desc">{selectedProject.desc}</p>
                                    <div className="aw-modal-meta">
                                        <div className="aw-meta-item">
                                            <h4>Location</h4>
                                            <p>{selectedProject.location || 'Europe'}</p>
                                        </div>
                                        <div className="aw-meta-item">
                                            <h4>Year</h4>
                                            <p>{selectedProject.year || '2025'}</p>
                                        </div>
                                        <div className="aw-meta-item">
                                            <h4>Status</h4>
                                            <p>{selectedProject.status || 'Completed'}</p>
                                        </div>
                                        <div className="aw-meta-item">
                                            <h4>Type</h4>
                                            <p>{selectedProject.type || 'Residential'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ArchitectureAllWork;
