import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

const collageLayout = [
    // Fixed expanded arrangement: a tall lead image surrounded by broad and
    // portrait studies that overlap into one compact editorial stack.
    { x: 0, y: 0.01, width: 0.235, ratio: 0.76, rotation: 0, depth: 40, scale: 1 },
    { x: -0.19, y: -0.23, width: 0.17, ratio: 1.3, rotation: -0.5, depth: 12, scale: 0.94 },
    { x: 0.22, y: -0.22, width: 0.18, ratio: 1.4, rotation: 0.4, depth: 10, scale: 0.96 },
    { x: -0.335, y: -0.1, width: 0.18, ratio: 1.42, rotation: 0.2, depth: 18, scale: 0.91 },
    { x: 0.295, y: -0.1, width: 0.18, ratio: 0.92, rotation: -0.3, depth: 22, scale: 0.94 },
    { x: -0.265, y: 0.15, width: 0.17, ratio: 1.12, rotation: 0.4, depth: 24, scale: 0.93 },
    { x: 0.205, y: 0.14, width: 0.19, ratio: 1.14, rotation: -0.4, depth: 20, scale: 0.95 },
    { x: -0.08, y: -0.285, width: 0.16, ratio: 1.52, rotation: 0.3, depth: 7, scale: 0.88 },
    { x: 0.055, y: 0.205, width: 0.16, ratio: 0.8, rotation: -0.3, depth: 30, scale: 0.92 },
    { x: -0.345, y: 0.075, width: 0.16, ratio: 0.9, rotation: -0.3, depth: 15, scale: 0.9 },
    { x: 0.345, y: 0.04, width: 0.18, ratio: 1.3, rotation: 0.3, depth: 13, scale: 0.92 },
    { x: 0.025, y: -0.22, width: 0.155, ratio: 0.78, rotation: -0.2, depth: 6, scale: 0.88 },
];

const ArchitectureAllWork = () => {
    const collageRef = useRef(null);
    const cardRefs = useRef([]);
    const timelineRef = useRef(null);
    const focusIndexRef = useRef(0);
    const [focusIndex, setFocusIndex] = useState(0);
    const [selectedProject, setSelectedProject] = useState(null);
    const modalImgRef = useRef(null);
    const modalInfoRef = useRef(null);
    const { getText, getImage, wpContent } = useContent();
    const headerTitle = getText('architecture_all', 'header_title', 'ALL WORK');

    const allProjects = useMemo(() => {
        const crmProjects = wpContent?.architecture_all?.projects;
        return Array.isArray(crmProjects) && crmProjects.length > 0
            ? crmProjects.map((item, idx) => {
                const fallback = defaultAllProjects[idx % defaultAllProjects.length];
                return {
                    id: item.id || idx + 1,
                    title: item.title || fallback.title || `Project ${idx + 1}`,
                    desc: item.desc || fallback.desc || '',
                    location: item.location || fallback.location || 'Europe',
                    year: item.year || fallback.year || '2025',
                    status: item.status || fallback.status || 'Completed',
                    type: item.type || fallback.type || 'Residential',
                    image: item.image || getImage('architecture_all', idx, fallback.image || bg1),
                    imagePosition: item.image_position || 'center',
                };
            })
            : defaultAllProjects.map((item, idx) => ({
                ...item,
                image: getImage('architecture_all', idx, item.image),
                imagePosition: 'center',
            }));
    }, [wpContent?.architecture_all?.projects, getImage]);

    const displayProjects = useMemo(() => {
        const visibleCount = Math.min(collageLayout.length, allProjects.length);
        return Array.from({ length: visibleCount }, (_, slot) => ({
            project: allProjects[(focusIndex + slot) % allProjects.length],
            slot,
        }));
    }, [allProjects, focusIndex]);

    useEffect(() => {
        focusIndexRef.current = Math.min(focusIndexRef.current, Math.max(0, allProjects.length - 1));
        setFocusIndex(focusIndexRef.current);
    }, [allProjects.length]);

    useLayoutEffect(() => {
        const stage = collageRef.current;
        const cards = cardRefs.current.slice(0, displayProjects.length).filter(Boolean);
        if (!stage || !cards.length) return undefined;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timeline;

        const getGeometry = () => {
            const bounds = stage.getBoundingClientRect();
            const isMobile = bounds.width <= 600;
            const unit = Math.min(bounds.width * (isMobile ? 1.58 : 1), 1500);
            const titleRect = document.querySelector('.all-work-title')?.getBoundingClientRect();
            const titleBottom = titleRect ? titleRect.bottom - bounds.top : bounds.height * 0.28;
            const centerY = bounds.height * (isMobile ? 0.57 : 0.55);
            cards.forEach((card, index) => {
                const layout = collageLayout[index];
                const cardWidth = Math.min(unit * layout.width, isMobile ? bounds.width * 0.36 : bounds.width * 0.255);
                card.style.width = `${cardWidth}px`;
                card.style.aspectRatio = String(layout.ratio);
                card.style.visibility = 'visible';
                card.style.pointerEvents = 'auto';
                card.tabIndex = 0;
            });
            const geometry = collageLayout.slice(0, cards.length).map((layout, index) => {
                const cardWidth = parseFloat(cards[index].style.width);
                const cardHeight = cardWidth / layout.ratio;
                const x = layout.x * bounds.width;
                const y = (centerY - bounds.height / 2) + layout.y * bounds.height;
                const minY = Math.min(bounds.height - cardHeight / 2 - 22, titleBottom + cardHeight / 2 + (isMobile ? 20 : 16));
                const maxY = Math.max(minY, bounds.height - cardHeight / 2 - 22);
                const screenY = Math.max(minY, Math.min(maxY, bounds.height / 2 + y));
                const minX = cardWidth / 2 + 22;
                const maxX = bounds.width - cardWidth / 2 - 22;
                const screenX = Math.max(minX, Math.min(maxX, bounds.width / 2 + x));
                return {
                    x: screenX - bounds.width / 2,
                    y: screenY - bounds.height / 2,
                    width: cardWidth,
                    height: cardHeight,
                };
            });
            const boundPose = (x, y, index) => {
                const item = geometry[index];
                const minX = item.width / 2 + 22;
                const maxX = bounds.width - item.width / 2 - 22;
                const minY = Math.min(bounds.height - item.height / 2 - 22, titleBottom + item.height / 2 + (isMobile ? 20 : 16));
                const maxY = Math.max(minY, bounds.height - item.height / 2 - 22);
                return {
                    x: Math.max(minX, Math.min(maxX, bounds.width / 2 + x)) - bounds.width / 2,
                    y: Math.max(minY, Math.min(maxY, bounds.height / 2 + y)) - bounds.height / 2,
                };
            };

            const makeExpandedPose = (angle, leadCard, drift = 0) => geometry.map((item, index) => {
                const radians = angle * Math.PI / 180;
                const x = item.x * Math.cos(radians) - item.y * Math.sin(radians);
                const y = item.x * Math.sin(radians) + item.y * Math.cos(radians);
                const bounded = boundPose(
                    x + ((index % 3) - 1) * bounds.width * drift,
                    y + ((index % 4) - 1.5) * bounds.height * drift * 0.5,
                    index,
                );
                return {
                    ...bounded,
                    z: index === leadCard ? 115 : collageLayout[index].depth * 2 - 34,
                    rotation: collageLayout[index].rotation + angle * 0.12,
                    rotationY: 0,
                    scale: collageLayout[index].scale,
                };
            });

            const makeCompactPose = (leadCard) => geometry.map((item, index) => {
                const offset = index - leadCard;
                const bounded = boundPose(
                    offset * bounds.width * 0.006,
                    (centerY - bounds.height / 2) + ((index % 4) - 1.5) * bounds.height * 0.012 + offset * bounds.height * 0.0025,
                    index,
                );
                return {
                    ...bounded,
                    z: index === leadCard ? 130 : 35 - Math.abs(offset) * 18,
                    rotation: (index - leadCard) * 0.22,
                    rotationY: (index === leadCard ? 0 : (offset % 2 ? 1 : -1) * (8 + (index % 4) * 2)),
                    scale: index === leadCard ? 0.92 : 0.54 + ((index * 7) % 5) * 0.045,
                };
            });

            const makeEdgePose = (leadCard) => geometry.map((item, index) => {
                const offset = index - leadCard;
                const bounded = boundPose(
                    offset * bounds.width * 0.014,
                    (centerY - bounds.height / 2) + ((index % 4) - 1.5) * bounds.height * 0.022 + offset * bounds.height * 0.003,
                    index,
                );
                return {
                    ...bounded,
                    z: 100 - Math.abs(offset) * 16,
                    rotation: (index % 3 - 1) * 0.6,
                    rotationY: 0,
                    scale: 0.72 + ((index * 3) % 4) * 0.045,
                };
            });

            return {
                expandedA: makeExpandedPose(0, 0),
                expandedB: makeExpandedPose(8, 0, 0.006),
                expandedC: makeExpandedPose(-10, 1, 0.008),
                expandedD: makeExpandedPose(7, 2, 0.008),
                expandedE: makeExpandedPose(-5, 3, 0.006),
                compactA: makeCompactPose(0),
                compactB: makeCompactPose(4),
                edgeA: makeEdgePose(0),
                edgeB: makeEdgePose(1),
            };
        };

        const createTimeline = () => {
            const poses = getGeometry();
            const setLead = (leadIndex) => cards.forEach((card, index) => {
                card.style.zIndex = String(index === leadIndex ? 80 : collageLayout[index]?.depth ?? 1);
            });
            const tweenPose = (pose, duration, stagger = 0.025, ease = 'power3.inOut', position) => timeline.to(cards, {
                x: (index) => pose[index]?.x ?? 0,
                y: (index) => pose[index]?.y ?? 0,
                z: (index) => pose[index]?.z ?? 0,
                rotation: (index) => pose[index]?.rotation ?? 0,
                rotationY: (index) => pose[index]?.rotationY ?? 0,
                scale: (index) => pose[index]?.scale ?? 1,
                duration,
                stagger: { each: stagger, from: 'center' },
                ease,
            }, position);

            if (reducedMotion.matches || !cards.length) {
                cards.forEach((card, index) => {
                    const pose = poses.expandedA[index];
                    gsap.set(card, { ...pose, xPercent: -50, yPercent: -50, autoAlpha: 1 });
                });
                setLead(0);
                return null;
            }

            timeline = gsap.timeline({ repeat: -1, defaults: { overwrite: 'auto' } });
            cards.forEach((card, index) => {
                gsap.set(card, { ...poses.expandedA[index], xPercent: -50, yPercent: -50, autoAlpha: 1 });
            });
            setLead(0);

            timeline.to({}, { duration: 0.35 });
            timeline.call(() => setLead(0));
            tweenPose(poses.compactA, 0.72, 0.035, 'power3.inOut');
            timeline.to({}, { duration: 0.16 });
            timeline.call(() => setLead(0));
            timeline.to(stage, { rotationY: 78, duration: 0.58, ease: 'power2.inOut' });
            tweenPose(poses.edgeA, 0.55, 0.02, 'power2.inOut', '<');

            timeline.call(() => setLead(0));
            timeline.to(stage, { rotationY: 0, duration: 0.5, ease: 'power2.inOut' });
            tweenPose(poses.expandedB, 0.95, 0.03, 'power3.out', '<');
            timeline.to({}, { duration: 1.35 });

            timeline.call(() => setLead(1));
            tweenPose(poses.expandedC, 0.62, 0.018, 'power2.inOut');
            timeline.to(stage, { rotationY: 76, duration: 0.58, ease: 'power2.inOut' });
            tweenPose(poses.edgeB, 0.55, 0.02, 'power2.inOut', '<');

            timeline.call(() => setLead(2));
            timeline.to(stage, { rotationY: 0, duration: 0.48, ease: 'power2.inOut' });
            tweenPose(poses.expandedD, 0.86, 0.025, 'power3.out', '<');
            timeline.to({}, { duration: 1.35 });

            timeline.call(() => setLead(3));
            tweenPose(poses.expandedE, 0.72, 0.02, 'power2.inOut');
            timeline.call(() => setLead(4));
            tweenPose(poses.compactB, 0.68, 0.03, 'power3.inOut');
            timeline.to({}, { duration: 0.16 });
            timeline.call(() => {
                const next = (focusIndexRef.current + 1) % allProjects.length;
                focusIndexRef.current = next;
                setFocusIndex(next);
            });
            timeline.call(() => setLead(0));
            timeline.to(stage, { rotationY: 0, duration: 0.08, ease: 'none' });
            tweenPose(poses.expandedA, 0.92, 0.03, 'power3.out', '<');
            timeline.to({}, { duration: 1.35 });
            timelineRef.current = timeline;
            return timeline;
        };

        const rebuild = () => {
            timeline?.kill();
            gsap.killTweensOf(cards);
            gsap.killTweensOf(stage);
            stage.style.transform = '';
            timeline = createTimeline();
        };

        rebuild();
        let resizeTimer;
        const onResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(rebuild, 140);
        };
        const onMotionChange = () => rebuild();
        window.addEventListener('resize', onResize);
        reducedMotion.addEventListener?.('change', onMotionChange);
        timelineRef.current = timeline;

        return () => {
            window.clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            reducedMotion.removeEventListener?.('change', onMotionChange);
            timeline?.kill();
            gsap.killTweensOf(cards);
            timelineRef.current = null;
        };
    }, [displayProjects.length, allProjects.length]);

    useEffect(() => {
        if (selectedProject) timelineRef.current?.pause();
        else timelineRef.current?.resume();
    }, [selectedProject]);

    useEffect(() => {
        if (!selectedProject) return undefined;
        const onKeyDown = (event) => { if (event.key === 'Escape') setSelectedProject(null); };
        window.addEventListener('keydown', onKeyDown);
        const modalTimeline = gsap.timeline();
        modalTimeline.fromTo(modalImgRef.current, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' })
            .fromTo(modalInfoRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.42');
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            modalTimeline.kill();
        };
    }, [selectedProject]);

    return (
        <div className="all-work-page">
            <main className="all-work-main">
                <section className="all-work-title" aria-labelledby="all-work-heading">
                    <p className="all-work-title__eyebrow">AJIDHAS &amp; ASSOCIATES <i aria-hidden="true" /></p>
                    <h1 className="aw-title" id="all-work-heading">{headerTitle}</h1>
                    <span aria-hidden="true" />
                </section>

                <section className="all-work-collage" ref={collageRef} aria-label="Architecture project portfolio">
                    <div className="all-work-collage__stage">
                        {displayProjects.map(({ project, slot }) => (
                            <button
                                key={slot}
                                ref={(node) => { cardRefs.current[slot] = node; }}
                                className="all-work-card"
                                type="button"
                                aria-label={`View ${project.title}`}
                                aria-haspopup="dialog"
                                onClick={() => setSelectedProject(project)}
                            >
                                <img src={project.image} alt={project.title} loading={slot < 8 ? 'eager' : 'lazy'} decoding="async" draggable="false" style={{ objectPosition: project.imagePosition || 'center' }} />
                                <span className="all-work-card__caption"><strong>{project.title}</strong><small>{project.location} · {project.year}</small></span>
                            </button>
                        ))}
                    </div>
                </section>
            </main>

            <div className={`aw-modal${selectedProject ? ' active' : ''}`} aria-hidden={!selectedProject}>
                {selectedProject && (
                    <>
                        <img src={selectedProject.image} alt="" className="aw-modal-bg" />
                        <button className="aw-modal-close" type="button" aria-label="Close project details" onClick={() => setSelectedProject(null)}>×</button>
                        <div className="aw-modal-content" role="dialog" aria-modal="true" aria-labelledby="aw-modal-title" onClick={(event) => {
                            if (event.target.classList.contains('aw-modal-content')) setSelectedProject(null);
                        }}>
                            <div className="aw-modal-inner">
                                <div className="aw-modal-image-container" ref={modalImgRef}><img src={selectedProject.image} alt={selectedProject.title} /></div>
                                <div className="aw-modal-info" ref={modalInfoRef}>
                                    <p className="aw-modal-eyebrow">{selectedProject.type || 'Architecture'} · {selectedProject.year || '2025'}</p>
                                    <h2 className="aw-modal-title" id="aw-modal-title">{selectedProject.title}</h2>
                                    <p className="aw-modal-desc">{selectedProject.desc}</p>
                                    <dl className="aw-modal-meta">
                                        <div className="aw-meta-item"><dt>Location</dt><dd>{selectedProject.location || 'Europe'}</dd></div>
                                        <div className="aw-meta-item"><dt>Year</dt><dd>{selectedProject.year || '2025'}</dd></div>
                                        <div className="aw-meta-item"><dt>Status</dt><dd>{selectedProject.status || 'Completed'}</dd></div>
                                        <div className="aw-meta-item"><dt>Type</dt><dd>{selectedProject.type || 'Residential'}</dd></div>
                                    </dl>
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

