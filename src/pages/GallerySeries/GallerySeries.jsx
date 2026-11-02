import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './GallerySeries.css';

const GallerySeries = () => {
    const navigate = useNavigate();
    const { getText, wpContent, loading } = useContent();
    const viewportRef = useRef(null);
    const cardRefs = useRef([]);
    const hoverScalesRef = useRef([]);
    const frameRef = useRef(0);
    const phaseRef = useRef(0);
    const activeIndexRef = useRef(0);
    const layoutCardsRef = useRef(null);
    const lastTimeRef = useRef(0);
    const hoverRef = useRef(false);
    const hoveredCardRef = useRef(-1);
    const manualUntilRef = useRef(0);
    const dragRef = useRef({ active: false, moved: false, startX: 0, startPhase: 0, pointerId: null });
    const [activeIndex, setActiveIndex] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const sourceItems = wpContent?.gallery?.items;
    const galleryItems = useMemo(() => Array.isArray(sourceItems)
        ? sourceItems.filter((item) => item && (item.image || item.title || item.label)).map((item) => ({
            ...item,
            // The CRM admin stores the WordPress media URL in its `image` field.
            image: typeof item.image === 'string' ? item.image.trim() : '',
            isPlaceholderImage: item.image_is_placeholder === true || !item.image,
        }))
        : [], [sourceItems]);
    const title = getText('gallery', 'header_title', 'Artistic Series');
    const footerHint = getText('gallery', 'footer_hint', 'Scroll to explore');
    const repeatedItems = useMemo(() => galleryItems.length > 1
        ? Array.from({ length: 5 }, (_, loop) => galleryItems.map((item, index) => ({ item, index, key: `${loop}-${item.id || index}` }))).flat()
        : galleryItems.map((item, index) => ({ item, index, key: `single-${item.id || index}` })), [galleryItems]);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, repeatedItems.length);
        galleryItems.forEach(({ image, isPlaceholderImage }) => {
            if (!image || isPlaceholderImage) return;
            const preload = new Image();
            preload.decoding = 'async';
            preload.src = image;
            preload.decode?.().catch(() => {});
        });
    }, [galleryItems, repeatedItems.length]);

    const changeBy = useCallback((delta) => {
        if (galleryItems.length < 2) return;
        phaseRef.current = (phaseRef.current + delta + galleryItems.length) % galleryItems.length;
        manualUntilRef.current = performance.now() + 3200;
        const nextIndex = Math.floor(phaseRef.current) % galleryItems.length;
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        layoutCardsRef.current?.(phaseRef.current);
    }, [galleryItems.length]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!galleryItems.length) return undefined;

        const layoutCards = (phase) => {
            const cardWidth = viewportRef.current?.clientWidth || window.innerWidth;
            const step = Math.min(350, Math.max(190, cardWidth * (window.innerWidth <= 600 ? 0.54 : 0.2)));
            const centerVirtualIndex = galleryItems.length > 1 ? galleryItems.length * 2 : 0;
            let closestIndex = 0;
            let closestDistance = Infinity;

            cardRefs.current.forEach((card, virtualIndex) => {
                if (!card) return;
                const offset = virtualIndex - centerVirtualIndex - phase;
                const x = offset * step;
                const distance = Math.abs(offset);
                const sign = Math.sign(offset);
                const scale = Math.max(0.48, 1 - Math.min(distance, 4) * 0.17);
                const angle = sign * Math.min(52, distance * (window.innerWidth <= 600 ? 20 : 28));
                const isHovered = hoveredCardRef.current === virtualIndex;
                const currentHoverScale = hoverScalesRef.current[virtualIndex] || 1;
                const hoverScale = currentHoverScale + ((isHovered ? 1.045 : 1) - currentHoverScale) * 0.18;
                hoverScalesRef.current[virtualIndex] = hoverScale;
                const opacity = Math.max(0, 1 - Math.max(0, distance - 1.1) * 0.24);
                card.style.transform = `translate3d(calc(-50% + ${x}px), 0, ${Math.max(0, 170 - distance * 80)}px) rotateY(${angle}deg) scale(${scale * hoverScale})`;
                card.style.opacity = String(opacity);
                card.style.zIndex = String(100 - Math.round(distance * 10));
                card.classList.toggle('is-active', virtualIndex === centerVirtualIndex + Math.round(phase));
                card.style.setProperty('--card-glow', isHovered ? '0.7' : (distance < 0.5 ? '0.48' : '0'));
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = virtualIndex % galleryItems.length;
                }
            });
            return closestIndex;
        };

        layoutCardsRef.current = layoutCards;
        const initialIndex = layoutCards(phaseRef.current);
        activeIndexRef.current = initialIndex;
        setActiveIndex(initialIndex);
        if (media.matches || galleryItems.length < 2) {
            return () => { layoutCardsRef.current = null; };
        }

        const tick = (time) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const elapsed = Math.min((time - lastTimeRef.current) / 1000, 0.05);
            lastTimeRef.current = time;
            const isPaused = document.hidden || hoverRef.current || dragRef.current.active || performance.now() < manualUntilRef.current;
            if (!isPaused) phaseRef.current = (phaseRef.current + elapsed * 0.105) % galleryItems.length;
            const closestIndex = layoutCards(phaseRef.current);

            if (activeIndexRef.current !== closestIndex) {
                activeIndexRef.current = closestIndex;
                setActiveIndex(closestIndex);
            }
            frameRef.current = window.requestAnimationFrame(tick);
        };

        frameRef.current = window.requestAnimationFrame(tick);
        const handleVisibility = () => { lastTimeRef.current = 0; };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            window.cancelAnimationFrame(frameRef.current);
            document.removeEventListener('visibilitychange', handleVisibility);
            layoutCardsRef.current = null;
        };
    }, [galleryItems.length, repeatedItems.length]);

    useEffect(() => {
        const menuKey = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', menuKey);
        return () => window.removeEventListener('keydown', menuKey);
    }, []);

    const handlePointerDown = (event) => {
        if (galleryItems.length < 2 || event.button > 0) return;
        dragRef.current = { active: true, moved: false, startX: event.clientX, startPhase: phaseRef.current, pointerId: event.pointerId };
        setIsDragging(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        manualUntilRef.current = Infinity;
    };

    const handlePointerMove = (event) => {
        if (!dragRef.current.active) return;
        const delta = event.clientX - dragRef.current.startX;
        if (Math.abs(delta) > 6) dragRef.current.moved = true;
        if (!dragRef.current.moved) return;
        const step = Math.min(350, Math.max(190, (viewportRef.current?.clientWidth || window.innerWidth) * (window.innerWidth <= 600 ? 0.54 : 0.2)));
        phaseRef.current = ((dragRef.current.startPhase - delta / step) % galleryItems.length + galleryItems.length) % galleryItems.length;
        layoutCardsRef.current?.(phaseRef.current);
    };

    const handlePointerUp = () => {
        if (!dragRef.current.active) return;
        dragRef.current.active = false;
        setIsDragging(false);
        manualUntilRef.current = performance.now() + 2600;
        const nearest = Math.floor(phaseRef.current + 0.5) % galleryItems.length;
        phaseRef.current = nearest;
        activeIndexRef.current = nearest;
        setActiveIndex(nearest);
        layoutCardsRef.current?.(phaseRef.current);
    };

    const navigateBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/art');
    };

    const goTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    const indicatorTargets = galleryItems.length > 1
        ? [0, Math.floor((galleryItems.length - 1) / 2), galleryItems.length - 1]
        : [0, 0, 0];
    const activeIndicator = galleryItems.length > 1
        ? Math.min(2, Math.floor(activeIndex / galleryItems.length * 3))
        : 0;

    return (
        <div className="gallery-page-container">
            <header className="gallery-header">
                <div className="gallery-header__left">
                    <button className="gallery-back" type="button" onClick={navigateBack} aria-label="Back"><IoArrowBack /></button>
                    <span className="gallery-header__index">INDEX 03 / GALLERY</span>
                </div>
                <button
                    className={`gallery-menu-toggle${menuOpen ? ' is-open' : ''}`}
                    type="button"
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={menuOpen}
                    aria-controls="gallery-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                ><span /><span /><span /></button>
            </header>

            <main className="gallery-main">
                <div className="gallery-atmosphere" aria-hidden="true"><span /><span /><span /></div>
                <section className="gallery-title-block"><h1>{title}</h1><span aria-hidden="true" /></section>
                <section
                    className={`gallery-carousel${isDragging ? ' is-dragging' : ''}`}
                    ref={viewportRef}
                    aria-label="Artwork series carousel"
                    tabIndex={0}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowLeft') { event.preventDefault(); changeBy(-1); }
                        if (event.key === 'ArrowRight') { event.preventDefault(); changeBy(1); }
                    }}
                    onPointerEnter={(event) => { if (event.pointerType === 'mouse') hoverRef.current = true; }}
                    onPointerLeave={(event) => { if (event.pointerType === 'mouse') { hoverRef.current = false; hoveredCardRef.current = -1; } }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onWheel={(event) => {
                        if (Math.abs(event.deltaX) < 3 || galleryItems.length < 2) return;
                        event.preventDefault();
                        phaseRef.current = (phaseRef.current + Math.sign(event.deltaX) * Math.min(Math.abs(event.deltaX) / 350, 1) + galleryItems.length) % galleryItems.length;
                        manualUntilRef.current = performance.now() + 1800;
                        layoutCardsRef.current?.(phaseRef.current);
                    }}
                >
                    <div className="gallery-floor" aria-hidden="true" />
                    <button className="gallery-arrow gallery-arrow--previous" type="button" aria-label="Previous artwork" onClick={() => changeBy(-1)} disabled={galleryItems.length < 2}><IoChevronBack /></button>
                    <div className="gallery-card-stage">
                        {repeatedItems.map(({ item, index, key }, virtualIndex) => (
                            <button
                                className={`gallery-card${galleryItems.length === 1 ? ' is-active' : ''}${item.isPlaceholderImage ? ' is-placeholder' : ''}`}
                                key={key}
                                ref={(node) => { cardRefs.current[virtualIndex] = node; }}
                                type="button"
                                aria-label={`Open ${item.title || item.label || 'artwork series'}`}
                                onPointerEnter={(event) => { if (event.pointerType === 'mouse') hoveredCardRef.current = virtualIndex; }}
                                onPointerLeave={() => { if (hoveredCardRef.current === virtualIndex) hoveredCardRef.current = -1; }}
                                onClick={() => {
                                    if (dragRef.current.moved) { dragRef.current.moved = false; return; }
                                    navigate(`/art/preview/${item.id || index + 1}`);
                                }}
                            >
                                <span className="gallery-card__placeholder" aria-hidden="true" />
                                {!item.isPlaceholderImage && <img
                                        src={item.image}
                                        alt={item.title || item.label || 'Artwork'}
                                        loading={virtualIndex < galleryItems.length * 2 + 3 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        draggable="false"
                                        onError={(event) => event.currentTarget.closest('.gallery-card')?.classList.add('is-placeholder')}
                                    />}
                                <span className="gallery-card__glass" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                    <button className="gallery-arrow gallery-arrow--next" type="button" aria-label="Next artwork" onClick={() => changeBy(1)} disabled={galleryItems.length < 2}><IoChevronForward /></button>
                    {!galleryItems.length && <p className="gallery-empty">{loading ? 'Loading artwork series…' : 'No artwork series are available yet.'}</p>}
                </section>
                {galleryItems.length > 1 && <nav className="gallery-pagination" aria-label="Carousel pagination">
                    {indicatorTargets.map((target, index) => <button
                        type="button"
                        className={index === activeIndicator ? 'is-active' : ''}
                        key={index}
                        aria-label={`Go to gallery section ${index + 1}`}
                        aria-current={index === activeIndicator ? 'true' : undefined}
                        onClick={() => {
                            phaseRef.current = target;
                            manualUntilRef.current = performance.now() + 3200;
                            activeIndexRef.current = target;
                            setActiveIndex(target);
                            layoutCardsRef.current?.(phaseRef.current);
                        }}
                    />)}
                </nav>}
            </main>

            <section className="gallery-footer" aria-label="Gallery scroll hint">
                <div className="scroll-indicator">
                    <div className="indicator-line" />
                    <span>{footerHint}</span>
                </div>
            </section>

            <button className={`gallery-menu-backdrop${menuOpen ? ' is-visible' : ''}`} type="button" aria-label="Close navigation menu" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)} />
            <aside id="gallery-menu" className={`gallery-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
                <p className="gallery-menu__eyebrow">AJIDHAS ASSOCIATES</p>
                <p className="gallery-menu__heading">Explore the studio</p>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/')}>Studio <span>01</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/art')}>Art Studio <span>02</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/art/gallery')}>Gallery <span>03</span></button>
                <button type="button" tabIndex={menuOpen ? 0 : -1} onClick={() => goTo('/architecture')}>Architecture <span>04</span></button>
                <p className="gallery-menu__footer">Art and architecture, thoughtfully made.</p>
            </aside>
        </div>
    );
};

export default GallerySeries;
