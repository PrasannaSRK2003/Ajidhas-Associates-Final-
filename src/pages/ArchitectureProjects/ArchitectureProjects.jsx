import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowDownOutline } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import { resolveArchitectureProjects } from './architectureProjectsData';
import './ArchitectureProjects.css';

const IMAGE_SLIDE_DURATION_MS = 5000;

const FullBleedSlideTrack = ({ slides, activeIndex, onAdvance, onSlideClick, mediaClassName }) => {
    const videoRefs = useRef([]);
    const currentSlide = slides[activeIndex];
    const currentType = currentSlide?.type === 'video' ? 'video' : 'image';

    // Auto-advance images after 5s; videos advance via onEnded when playback finishes
    useEffect(() => {
        if (slides.length < 2 || currentType === 'video') return undefined;
        const timer = window.setTimeout(onAdvance, IMAGE_SLIDE_DURATION_MS);
        return () => window.clearTimeout(timer);
    }, [slides.length, activeIndex, currentType, onAdvance]);

    // Restart active video from 0s and pause inactive videos
    useEffect(() => {
        videoRefs.current.forEach((videoEl, idx) => {
            if (!videoEl) return;
            if (idx === activeIndex) {
                try {
                    videoEl.currentTime = 0;
                } catch {
                    // Ignore seek errors before metadata loads
                }
                videoEl.play().catch(() => {});
            } else {
                videoEl.pause();
            }
        });
    }, [activeIndex, slides.length]);

    return (
        <div className="arch-hero-slides">
            {slides.map((slide, index) => {
                const isActive = index === activeIndex;
                const isVideo = slide.type === 'video' && Boolean(slide.url);

                return (
                    <div
                        key={slide.id || `${slide.url}-${index}`}
                        className={`arch-hero-slide${isActive ? ' is-active' : ''}`}
                        aria-hidden={!isActive}
                    >
                        <button
                            type="button"
                            className="arch-hero-media-btn"
                            tabIndex={isActive ? 0 : -1}
                            aria-label={`Open ${slide.title || slide.caption || 'project'}`}
                            onClick={() => onSlideClick(slide)}
                        >
                            {isVideo ? (
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    className={mediaClassName}
                                    src={slide.url}
                                    poster={slide.poster || undefined}
                                    autoPlay={isActive}
                                    muted
                                    loop={slides.length <= 1}
                                    playsInline
                                    preload="auto"
                                    onEnded={() => {
                                        if (isActive && slides.length > 1) {
                                            onAdvance();
                                        }
                                    }}
                                    onError={() => {
                                        if (isActive && slides.length > 1) {
                                            onAdvance();
                                        }
                                    }}
                                />
                            ) : (
                                <img
                                    className={mediaClassName}
                                    src={slide.url}
                                    alt={slide.caption || slide.title || 'Architecture project'}
                                />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

const ProjectScrollSection = ({ project, index, sectionRef, onOpenDetail }) => {
    const [slideIdx, setSlideIdx] = useState(0);
    const slides = useMemo(() => (
        project.showcaseSlides?.length
            ? project.showcaseSlides
            : [{ id: `${project.id}-0`, type: project.mediaType, url: project.video || project.image, poster: project.image, caption: project.title }]
    ), [project]);

    const activeIndex = slides.length ? slideIdx % slides.length : 0;
    const advanceSlide = useCallback(() => {
        setSlideIdx((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const resolvedSide = project.textPosition === 'left' || project.textPosition === 'right'
        ? project.textPosition
        : (index % 2 === 0 ? 'right' : 'left');

    return (
        <section
            ref={sectionRef}
            className="arch-scroll-section"
            aria-label={project.title}
        >
            <FullBleedSlideTrack
                slides={slides}
                activeIndex={activeIndex}
                onAdvance={advanceSlide}
                onSlideClick={() => onOpenDetail(project.id)}
                mediaClassName="arch-scroll-media"
            />

            <div className="arch-hero-scrim" aria-hidden="true" />

            <div className={`arch-scroll-caption is-${resolvedSide}${slides.length > 1 ? ' has-dots' : ''}`}>
                <span className="arch-hero-category">
                    {project.category}
                    {project.location ? ` · ${project.location}` : ''}
                    {project.year ? `, ${project.year}` : ''}
                </span>
                <button
                    type="button"
                    className="arch-hero-title-btn"
                    onClick={() => onOpenDetail(project.id)}
                >
                    <h2>{project.title}</h2>
                </button>
                {project.description && (
                    <p className="arch-scroll-desc">{project.description}</p>
                )}
            </div>

            {slides.length > 1 && (
                <nav className="arch-hero-dots" aria-label={`${project.title} media slides`}>
                    {slides.map((slide, sIndex) => (
                        <button
                            key={slide.id || sIndex}
                            type="button"
                            className={`arch-hero-dot${sIndex === activeIndex ? ' is-active' : ''}`}
                            aria-label={`Show ${project.title} media ${sIndex + 1}`}
                            aria-current={sIndex === activeIndex ? 'true' : undefined}
                            onClick={() => setSlideIdx(sIndex)}
                        />
                    ))}
                </nav>
            )}
        </section>
    );
};

const ArchitectureProjects = () => {
    const navigate = useNavigate();
    const { wpContent } = useContent();
    const projects = useMemo(() => resolveArchitectureProjects(wpContent), [wpContent]);

    // Flatten each project's showcase media (images & videos) for the hero slider
    const heroSlides = useMemo(() => (
        projects.flatMap((project) => (
            (project.showcaseSlides?.length ? project.showcaseSlides : [{
                id: `${project.id}-hero`,
                type: project.mediaType,
                url: project.video || project.image,
                poster: project.image,
                caption: project.title,
            }]).map((slide, sIdx) => ({
                ...slide,
                id: `${project.id}-${slide.id || sIdx}`,
                projectId: project.id,
                category: project.category,
                title: project.title,
            }))
        ))
    ), [projects]);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [scrollState, setScrollState] = useState({ atBottom: false, inFooter: false });
    const pageRef = useRef(null);
    const heroRef = useRef(null);
    const sectionRefs = useRef([]);
    const touchStartXRef = useRef(null);

    const activeIndex = heroSlides.length ? currentSlide % heroSlides.length : 0;
    const activeSlide = heroSlides[activeIndex] || heroSlides[0];

    const advanceHeroSlide = useCallback(() => {
        if (heroSlides.length < 2) return;
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, [heroSlides.length]);

    useEffect(() => {
        const updateScrollState = () => {
            const sections = [heroRef.current, ...sectionRefs.current].filter(Boolean);
            if (!sections.length) return;

            const lastSection = sections[sections.length - 1];
            const lastRect = lastSection.getBoundingClientRect();
            const pageRect = pageRef.current?.getBoundingClientRect();

            const atBottom = lastRect.top <= window.innerHeight * 0.35;
            const inFooter = pageRect ? pageRect.bottom <= window.innerHeight * 0.55 : false;

            setScrollState((prev) => (
                prev.atBottom === atBottom && prev.inFooter === inFooter
                    ? prev
                    : { atBottom, inFooter }
            ));
        };

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            window.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [projects.length]);

    const openProjectDetail = useCallback((projectId) => {
        navigate(`/architecture/projects/${projectId}`);
    }, [navigate]);

    const handleFixedArrowClick = () => {
        if (scrollState.atBottom) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const sections = [heroRef.current, ...sectionRefs.current].filter(Boolean);
        const nextSection = sections.find((el) => el.getBoundingClientRect().top > 40);
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleKeyDown = (event) => {
        if (heroSlides.length < 2) return;
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        }
    };

    const handleTouchStart = (event) => {
        if (event.touches?.[0]) {
            touchStartXRef.current = event.touches[0].clientX;
        }
    };

    const handleTouchEnd = (event) => {
        if (touchStartXRef.current === null || !event.changedTouches?.[0] || heroSlides.length < 2) {
            touchStartXRef.current = null;
            return;
        }
        const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
        touchStartXRef.current = null;
        if (Math.abs(deltaX) < 40) return;
        if (deltaX < 0) {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        } else {
            setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        }
    };

    return (
        <div className="arch-projects-page" ref={pageRef}>
            {/* Top Full-Bleed Hero Showcase (Image: 5s auto-slide, Video: auto-slide on end) */}
            <section
                ref={heroRef}
                className="arch-hero-showcase"
                aria-label="Featured architecture projects"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <FullBleedSlideTrack
                    slides={heroSlides}
                    activeIndex={activeIndex}
                    onAdvance={advanceHeroSlide}
                    onSlideClick={(slide) => openProjectDetail(slide.projectId)}
                    mediaClassName="arch-hero-media"
                />

                <div className="arch-hero-scrim" aria-hidden="true" />

                {activeSlide && (
                    <div className="arch-hero-caption">
                        <span className="arch-hero-category">{activeSlide.category}</span>
                        <button
                            type="button"
                            className="arch-hero-title-btn"
                            onClick={() => openProjectDetail(activeSlide.projectId)}
                        >
                            <h1>{activeSlide.title}</h1>
                        </button>
                    </div>
                )}

                {heroSlides.length > 1 && (
                    <nav className="arch-hero-dots" aria-label="Project slides">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                className={`arch-hero-dot${index === activeIndex ? ' is-active' : ''}`}
                                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                                aria-current={index === activeIndex ? 'true' : undefined}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </nav>
                )}
            </section>

            {/* Full-Screen Scrollable Project Sections (Alternating Bottom-Right -> Bottom-Left) */}
            <div className="arch-scroll-stack" aria-label="All architecture projects">
                {projects.map((project, index) => (
                    <ProjectScrollSection
                        key={project.id}
                        project={project}
                        index={index}
                        sectionRef={(el) => {
                            sectionRefs.current[index] = el;
                        }}
                        onOpenDetail={openProjectDetail}
                    />
                ))}
            </div>

            {projects.length > 0 && (
                <button
                    type="button"
                    className={`arch-hero-scroll-pill${scrollState.atBottom ? ' is-up' : ''}${scrollState.inFooter ? ' is-hidden' : ''}`}
                    aria-label={scrollState.atBottom ? 'Scroll back to top' : 'Scroll to next project'}
                    onClick={handleFixedArrowClick}
                >
                    <IoArrowDownOutline aria-hidden="true" />
                </button>
            )}
        </div>
    );
};

export default ArchitectureProjects;
