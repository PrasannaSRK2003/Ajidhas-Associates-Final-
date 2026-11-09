import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './GallerySeries.css';

const localFallbackArtwork = [
    // Initial carousel order is center, inner-right, outer-right, outer-left, inner-left.
    { title: 'Limestone Forms', image: '/images/gallery/center-stone-sculpture.jpg', objectPosition: 'center' },
    { title: 'Monochrome Relief', image: '/images/gallery/inner-right-monochrome.jpg', objectPosition: 'center' },
    { title: 'Architectural Forms', image: '/images/gallery/outer-right-neutral-forms.jpg', objectPosition: 'center' },
    { title: 'Soft Geometry', image: '/images/gallery/outer-left-geometric.jpg', objectPosition: 'center' },
    { title: 'Plaster Study', image: '/images/gallery/inner-left-plaster-art.jpg', objectPosition: 'center' },
];

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
    const galleryItems = useMemo(() => {
        const cmsItems = Array.isArray(sourceItems)
            ? sourceItems.filter((item) => item && (item.image || item.title || item.label)).map((item, index) => {
                const fallback = localFallbackArtwork[index % localFallbackArtwork.length];
                const cmsImage = typeof item.image === 'string' ? item.image.trim() : '';
                const useFallback = item.image_is_placeholder === true || !cmsImage;
                return {
                    ...item,
                    // The CRM admin stores the WordPress media URL in its `image` field.
                    image: useFallback ? fallback.image : cmsImage,
                    objectPosition: item.image_position || fallback.objectPosition,
                    isPlaceholderImage: false,
                    isFallbackCard: false,
                    fallbackSlot: index % localFallbackArtwork.length,
                };
            })
            : [];

        const missingSlots = Math.max(0, localFallbackArtwork.length - cmsItems.length);
        const localItems = localFallbackArtwork.slice(cmsItems.length, cmsItems.length + missingSlots).map((artwork, index) => ({
            ...artwork,
            id: `local-fallback-${cmsItems.length + index}`,
            isPlaceholderImage: false,
            isFallbackCard: true,
            fallbackSlot: cmsItems.length + index,
        }));
        return [...cmsItems, ...localItems];
    }, [sourceItems]);

    const title = getText('gallery', 'header_title', 'Artistic Series');
    const repeatedItems = useMemo(() => galleryItems.length > 1
        ? Array.from({ length: 5 }, (_, loop) => galleryItems.map((item, index) => ({ item, index, key: `${loop}-${item.id || index}` }))).flat()
        : galleryItems.map((item, index) => ({ item, index, key: `single-${item.id || index}` })), [galleryItems]);

    const getCarouselSpacing = useCallback(() => {
        const viewportWidth = viewportRef.current?.clientWidth || window.innerWidth;
        const centerVirtualIndex = galleryItems.length > 1 ? galleryItems.length * 2 : 0;
        const cardWidth = cardRefs.current[centerVirtualIndex]?.offsetWidth || Math.min(310, viewportWidth * 0.16);
        const isMobile = viewportWidth <= 600;
        const innerVisualWidth = cardWidth * (isMobile ? 0.72 * Math.cos(12 * Math.PI / 180) : 0.84 * Math.cos(18 * Math.PI / 180));
        const outerVisualWidth = cardWidth * (isMobile ? 0.58 * Math.cos(36 * Math.PI / 180) : 0.70 * Math.cos(40 * Math.PI / 180));
        const innerGap = isMobile ? Math.min(12, Math.max(8, viewportWidth * 0.025)) : Math.min(84, Math.max(80, viewportWidth * 0.047));
        const outerGap = isMobile ? innerGap : Math.min(58, innerGap - 24);
        const step = (cardWidth + innerVisualWidth) / 2 + innerGap;
        const outerStep = (innerVisualWidth + outerVisualWidth) / 2 + outerGap;
        const sideMargin = isMobile ? 38 : viewportWidth <= 900 ? 44 : 24;
        const maxOuterCenter = Math.max(0, viewportWidth / 2 - outerVisualWidth / 2 - sideMargin);
        const fitScale = Math.min(1, maxOuterCenter / Math.max(1, step + outerStep));
        return { step: step * fitScale, outerStep: outerStep * fitScale };
    }, [galleryItems.length]);
    const getCarouselStep = useCallback(() => getCarouselSpacing().step, [getCarouselSpacing]);

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
            const { step, outerStep } = getCarouselSpacing();
            const centerVirtualIndex = galleryItems.length > 1 ? galleryItems.length * 2 : 0;
            const viewportWidth = viewportRef.current?.clientWidth || window.innerWidth;
            const visibleVirtualIndices = cardRefs.current
                .map((card, virtualIndex) => ({ virtualIndex, distance: Math.abs(virtualIndex - centerVirtualIndex - phase) }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5)
                .map(({ virtualIndex }) => virtualIndex);
            const visibleCards = new Set(visibleVirtualIndices);
            let closestIndex = 0;
            let closestDistance = Infinity;

            cardRefs.current.forEach((card, virtualIndex) => {
                if (!card) return;
                const offset = virtualIndex - centerVirtualIndex - phase;
                const distance = Math.abs(offset);
                const sign = Math.sign(offset);
                const isVisible = visibleCards.has(virtualIndex);
                card.style.visibility = isVisible ? 'visible' : 'hidden';
                card.style.pointerEvents = isVisible ? 'auto' : 'none';
                card.tabIndex = isVisible ? 0 : -1;
                if (!isVisible) {
                    card.style.opacity = '0';
                    return;
                }
                const x = sign * (distance <= 1 ? distance * step : step + (distance - 1) * outerStep);
                const isMobile = viewportWidth <= 600;
                const scale = distance <= 1
                    ? 1 - distance * (isMobile ? 0.28 : 0.16)
                    : (isMobile ? 0.72 : 0.84) - Math.min(distance - 1, 1) * 0.14;
                const angle = sign * Math.min(isMobile ? 36 : 40, distance <= 1
                    ? distance * (isMobile ? 12 : 18)
                    : (isMobile ? 12 : 18) + Math.min(distance - 1, 1) * (isMobile ? 24 : 22));
                const isHovered = hoveredCardRef.current === virtualIndex;
                const currentHoverScale = hoverScalesRef.current[virtualIndex] || 1;
                const hoverScale = currentHoverScale + ((isHovered ? 1.045 : 1) - currentHoverScale) * 0.18;
                hoverScalesRef.current[virtualIndex] = hoverScale;
                const opacity = Math.max(0.68, 1 - distance * 0.12);
                card.style.transform = `translate3d(calc(-50% + ${x}px), ${distance * 7}px, ${24 - distance * 60}px) rotateY(${angle}deg) scale(${scale * hoverScale})`;
                card.style.opacity = String(opacity);
                card.style.zIndex = String(100 - Math.round(distance * 10));
                card.classList.toggle('is-active', virtualIndex === centerVirtualIndex + Math.round(phase));
                card.classList.toggle('is-inner', distance > 0.5 && distance <= 1.5);
                card.classList.toggle('is-outer', distance > 1.5);
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
        if (media.matches || galleryItems.length < 2) return () => { layoutCardsRef.current = null; };

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
    }, [galleryItems.length, repeatedItems.length, getCarouselSpacing]);

    useEffect(() => {
        const menuKey = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
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
        const step = getCarouselStep();
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
    const goTo = (path) => { setMenuOpen(false); navigate(path); };
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
                <button className={`gallery-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="gallery-menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button>
            </header>

            <main className="gallery-main">
                <section className="gallery-title-block"><h1>{title}</h1><span aria-hidden="true" /></section>
                <section className={`gallery-carousel${isDragging ? ' is-dragging' : ''}`} ref={viewportRef} aria-label="Artwork series carousel" tabIndex={0}
                    onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); changeBy(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); changeBy(1); } }}
                    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}
                    onWheel={(event) => {
                        if (Math.abs(event.deltaX) < 3 || galleryItems.length < 2) return;
                        event.preventDefault();
                        phaseRef.current = (phaseRef.current + Math.sign(event.deltaX) * Math.min(Math.abs(event.deltaX) / getCarouselStep(), 1) + galleryItems.length) % galleryItems.length;
                        manualUntilRef.current = performance.now() + 1800;
                        layoutCardsRef.current?.(phaseRef.current);
                    }}
                >
                    <button className="gallery-arrow gallery-arrow--previous" type="button" aria-label="Previous artwork" onClick={() => changeBy(-1)} disabled={galleryItems.length < 2}><IoChevronBack /></button>
                    <div className="gallery-card-stage">
                        {repeatedItems.map(({ item, index, key }, virtualIndex) => (
                            <button className={`gallery-card${galleryItems.length === 1 ? ' is-active' : ''}${item.isPlaceholderImage ? ' is-placeholder' : ''}`} key={key}
                                ref={(node) => { cardRefs.current[virtualIndex] = node; }} type="button" aria-label={`Open ${item.title || item.label || 'artwork series'}`}
                                onPointerEnter={(event) => { if (event.pointerType === 'mouse') { hoverRef.current = true; hoveredCardRef.current = virtualIndex; } }}
                                onPointerLeave={(event) => { if (event.pointerType === 'mouse' && hoveredCardRef.current === virtualIndex) { hoverRef.current = false; hoveredCardRef.current = -1; } }}
                                onClick={() => {
                                    if (dragRef.current.moved) { dragRef.current.moved = false; return; }
                                    if (item.isFallbackCard) return;
                                    navigate(`/art/preview/${item.id || index + 1}`);
                                }}
                            >
                                <span className="gallery-card__placeholder" aria-hidden="true" />
                                {!item.isPlaceholderImage && <img src={item.image} alt={item.title || item.label || 'Artwork'} loading={virtualIndex < galleryItems.length * 2 + 3 ? 'eager' : 'lazy'} decoding="async" draggable="false" style={{ objectPosition: item.objectPosition || 'center' }}
                                    onError={(event) => {
                                        const fallback = localFallbackArtwork[item.fallbackSlot ?? index % localFallbackArtwork.length];
                                        if (fallback && event.currentTarget.getAttribute('src') !== fallback.image) {
                                            event.currentTarget.src = fallback.image;
                                            event.currentTarget.style.objectPosition = fallback.objectPosition;
                                            return;
                                        }
                                        event.currentTarget.closest('.gallery-card')?.classList.add('is-placeholder');
                                    }} />}
                                <span className="gallery-card__glass" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                    <button className="gallery-arrow gallery-arrow--next" type="button" aria-label="Next artwork" onClick={() => changeBy(1)} disabled={galleryItems.length < 2}><IoChevronForward /></button>
                    {!galleryItems.length && <p className="gallery-empty">{loading ? 'Loading artwork series…' : 'No artwork series are available yet.'}</p>}
                    {galleryItems.length > 1 && <nav className="gallery-pagination" aria-label="Carousel pagination">
                        {indicatorTargets.map((target, index) => <button type="button" className={index === activeIndicator ? 'is-active' : ''} key={index} aria-label={`Go to gallery section ${index + 1}`} aria-current={index === activeIndicator ? 'true' : undefined}
                            onClick={() => { phaseRef.current = target; manualUntilRef.current = performance.now() + 3200; activeIndexRef.current = target; setActiveIndex(target); layoutCardsRef.current?.(phaseRef.current); }} />)}
                    </nav>}
                </section>
            </main>

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
