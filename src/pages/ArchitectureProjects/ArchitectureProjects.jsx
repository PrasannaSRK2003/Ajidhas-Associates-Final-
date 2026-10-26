import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useContent } from '../../context/useContent';
import './ArchitectureProjects.css';

import arch1 from '../../assets/arch_project_1.png';
import arch2 from '../../assets/arch_project_2.png';
import arch3 from '../../assets/villa_solenne.png';

gsap.registerPlugin(ScrollTrigger);

const defaultProjects = [
    {
        id: 1,
        title: 'casa serena',
        location: 'BARCELONA',
        year: '2025',
        coords: '41.3851° N, 2.1734° E',
        description: 'a minimalist sanctuary where light dances through geometric volumes. clean lines meet warm materials in perfect harmony',
        designer: 'ANTONI MARTÍNEZ',
        image: arch1
    },
    {
        id: 2,
        title: 'skyline residence',
        location: 'DUBAI',
        year: '2025',
        coords: '25.2048° N, 55.2708° E',
        description: 'vertical living redefined. floor-to-ceiling glass frames the city below, while sustainable design meets luxury',
        designer: 'FATIMA AL-RASHID',
        image: arch2
    },
    {
        id: 3,
        title: 'forest pavilion',
        location: 'KYOTO',
        year: '2024',
        coords: '35.0116° N, 135.7681° E',
        description: 'traditional japanese aesthetics reimagined. natural wood, stone gardens, and the gentle sound of water',
        designer: 'KENJI TANAKA',
        image: arch3
    }
];

const ArchitectureProjects = () => {
    const containerRef = useRef(null);
    const { getImage, wpContent } = useContent();

    const projects = (wpContent?.architecture?.projects && Array.isArray(wpContent.architecture.projects) && wpContent.architecture.projects.length > 0)
        ? wpContent.architecture.projects.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultProjects[idx % defaultProjects.length]?.title || `Project ${idx + 1}`,
            location: item.location || defaultProjects[idx % defaultProjects.length]?.location || 'BARCELONA',
            year: item.year || defaultProjects[idx % defaultProjects.length]?.year || '2025',
            coords: item.coords || defaultProjects[idx % defaultProjects.length]?.coords || '41.3851° N, 2.1734° E',
            description: item.description || defaultProjects[idx % defaultProjects.length]?.description || '',
            designer: item.designer || defaultProjects[idx % defaultProjects.length]?.designer || 'ANTONI MARTÍNEZ',
            image: item.image || getImage('architecture', `project_${idx}`, defaultProjects[idx % defaultProjects.length]?.image || arch1)
        }))
        : defaultProjects.map((item, idx) => ({
            ...item,
            image: getImage('architecture', `project_${idx}`, item.image)
        }));

    useEffect(() => {
        const ctx = gsap.context(() => {
            const sections = gsap.utils.toArray('.project-editorial-section');

            sections.forEach((section) => {
                const title = section.querySelector('.editorial-title');
                const desc = section.querySelector('.editorial-description');
                const meta = section.querySelectorAll('.editorial-meta-item');
                const designer = section.querySelector('.editorial-designer');
                const bgImg = section.querySelector('.editorial-bg img');

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                });

                tl.fromTo(bgImg,
                    { scale: 1.2, filter: 'brightness(0)' },
                    { scale: 1, filter: 'brightness(0.6)', duration: 2, ease: 'power2.out' }
                )
                    .fromTo(title, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, '-=1.5')
                    .fromTo(desc, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.8')
                    .fromTo(meta, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, '-=0.6')
                    .fromTo(designer, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, '-=0.6');
            });

        }, containerRef);

        return () => ctx.revert();
    }, [projects.length]);

    return (
        <div className="arch-projects-editorial" ref={containerRef}>
            {projects.map((project, index) => (
                <section key={project.id} className={`project-editorial-section ${index % 2 !== 0 ? 'layout-left' : ''}`}>
                    <div className="editorial-bg">
                        <img src={project.image} alt={project.title} />
                        <div className="editorial-overlay"></div>
                    </div>

                    <div className="editorial-content">
                        <div className="editorial-top-left editorial-meta-item">
                            <p className="coords">{project.coords}</p>
                        </div>

                        <div className="editorial-top-right editorial-meta-item">
                            <p className="location-year">{project.location}, {project.year}</p>
                        </div>

                        <div className="editorial-center-right">
                            <h2 className="editorial-title">{project.title}</h2>
                        </div>

                        <div className="editorial-bottom-right">
                            <p className="editorial-description">{project.description}</p>
                        </div>

                        <div className="editorial-bottom-left editorial-designer">
                            <div className="designer-info">
                                <p>DESIGNED BY {project.designer}</p>
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default ArchitectureProjects;
