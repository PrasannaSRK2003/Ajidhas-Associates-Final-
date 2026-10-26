import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './Interior.css';

import buildingNight from '../../assets/building_night.png';
import villaLumiere from '../../assets/villa_lumiere.png';
import villaSolenne from '../../assets/villa_solenne.png';
import archProject1 from '../../assets/arch_project_1.png';

const defaultInteriors = [
    { id: 1, title: 'Go-to-urban', subtitle: 'Descubre la colección Evo', image: villaLumiere },
    { id: 2, title: 'Sublime', subtitle: 'Elegance in every detail', image: villaSolenne },
    { id: 3, title: 'Urban Echo', subtitle: 'Modern living spaces', image: archProject1 },
    { id: 4, title: 'Nightfall', subtitle: 'Shadows and light', image: buildingNight },
];

const Interior = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const { getImage, wpContent } = useContent();

    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const counterRef = useRef(null);
    const bgRef = useRef(null);
    const nextTitleRef = useRef(null);

    const interiors = (wpContent?.interior?.items && Array.isArray(wpContent.interior.items) && wpContent.interior.items.length > 0)
        ? wpContent.interior.items.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultInteriors[idx % defaultInteriors.length]?.title || `Interior ${idx + 1}`,
            subtitle: item.subtitle || defaultInteriors[idx % defaultInteriors.length]?.subtitle || 'Curated Design',
            image: item.image || getImage('interior', `slide_${idx}`, defaultInteriors[idx % defaultInteriors.length]?.image || villaLumiere)
        }))
        : defaultInteriors.map((item, idx) => ({
            ...item,
            image: getImage('interior', `slide_${idx}`, item.image)
        }));

    useEffect(() => {
        // Initial animation
        const tl = gsap.timeline();
        tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
            .fromTo(subtitleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
            .fromTo(counterRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.6')
            .fromTo(nextTitleRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, '-=0.6');
    }, []);

    const changeSlide = useCallback(() => {
        if (isAnimating || interiors.length === 0) return;
        setIsAnimating(true);

        const tl = gsap.timeline({
            onComplete: () => {
                const newIndex = (currentIndex + 1) % interiors.length;
                setCurrentIndex(newIndex);
                setNextIndex((newIndex + 1) % interiors.length);
                setIsAnimating(false);

                // Animate In
                gsap.fromTo([titleRef.current, subtitleRef.current, counterRef.current],
                    { x: 100, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }
                );
            }
        });

        // Animate Out
        tl.to([titleRef.current, subtitleRef.current, counterRef.current], {
            x: -100,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.in',
            stagger: 0.05
        });

        // BG Animation
        gsap.to(bgRef.current, {
            scale: 1.1,
            opacity: 0.4,
            duration: 0.6,
            yoyo: true,
            repeat: 1
        });
    }, [currentIndex, isAnimating, interiors.length]);

    // Auto-slide effect
    useEffect(() => {
        const timer = setTimeout(changeSlide, 5000);

        return () => clearTimeout(timer);
    }, [changeSlide]);

    const activeItem = interiors[currentIndex] || interiors[0] || {};
    const upcomingItem = interiors[nextIndex % interiors.length] || interiors[0] || {};

    return (
        <div className="interior-container">
            <div className="interior-bg-wrapper">
                <img
                    ref={bgRef}
                    src={activeItem.image}
                    alt={activeItem.title}
                    className="interior-bg"
                />
                <div className="interior-overlay"></div>
            </div>

            <div className="interior-content">
                <h1
                    ref={titleRef}
                    className="interior-title"
                    onClick={() => navigate('/architecture/interior/list', { state: { selectedId: activeItem.id } })}
                    style={{ cursor: 'pointer' }}
                >
                    {activeItem.title}
                </h1>
                <p ref={subtitleRef} className="interior-subtitle">{activeItem.subtitle}</p>
                <div ref={counterRef} className="interior-counter">
                    0{currentIndex + 1}/0{interiors.length}
                </div>
            </div>

            <div className="interior-nav-right" onClick={changeSlide}>
                <span ref={nextTitleRef} className="nav-next-title">{upcomingItem.title}</span>
                <button className="nav-btn-prof">
                    <div className="arrow-circle-next">→</div>
                </button>
            </div>
        </div>
    );
};

export default Interior;
