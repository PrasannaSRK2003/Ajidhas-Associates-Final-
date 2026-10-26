import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useContent } from '../../context/useContent';
import './Technology.css';

import buildingNight from '../../assets/villa_solenne.png';
import arch1 from '../../assets/arch_project_1.png';
import arch2 from '../../assets/arch_project_2.png';
import villa1 from '../../assets/villa_lumiere.png';
import villa2 from '../../assets/villa_solenne.png';

const defaultTechItems = [
    {
        id: 1,
        title: "Notes on Vision",
        subtitle: "12 Images",
        image: buildingNight,
        description: "Exploring the boundaries of visual perception through architectural lens. A study in light, shadow, and form.",
        year: "2024",
        location: "Berlin",
        subImages: [arch1, arch2, villa1, villa2]
    },
    {
        id: 2,
        title: "Undesignated",
        subtitle: "09 Images",
        image: arch1,
        description: "Spaces that defy traditional categorization. Fluid environments designed for adaptability and change.",
        year: "2023",
        location: "Tokyo",
        subImages: [buildingNight, arch2, villa1, villa2]
    },
    {
        id: 3,
        title: "Florence",
        subtitle: "20 Images",
        image: arch2,
        description: "A modern reinterpretation of classical Renaissance principles. Harmony, proportion, and beauty in the digital age.",
        year: "2025",
        location: "Florence",
        subImages: [buildingNight, arch1, villa1, villa2]
    },
    {
        id: 4,
        title: "Coherence",
        subtitle: "15 Images",
        image: villa1,
        description: "Finding unity in chaos. Structural integrity meets organic growth patterns.",
        year: "2024",
        location: "New York",
        subImages: [buildingNight, arch1, arch2, villa2]
    },
    {
        id: 5,
        title: "Urban Flux",
        subtitle: "18 Images",
        image: villa2,
        description: "Capturing the dynamic energy of metropolitan life. Architecture as a living, breathing entity.",
        year: "2023",
        location: "London",
        subImages: [buildingNight, arch1, arch2, villa1]
    }
];

const defaultImages = [buildingNight, arch1, arch2, villa1, villa2];

const Technology = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const marqueeRef = useRef(null);
    const initialCardRef = useRef(null);
    const marqueeTween = useRef(null);
    const bottomTextRef = useRef(null);
    const { getText, getImage, wpContent } = useContent();

    const mainTitle = getText('technology', 'header_title', 'TECHNOLOGY');
    const subtitle = getText('technology', 'subtitle', 'Innovation');

    const techItems = (wpContent?.technology?.items && Array.isArray(wpContent.technology.items) && wpContent.technology.items.length > 0)
        ? wpContent.technology.items.map((item, idx) => {
            const defaultItem = defaultTechItems[idx % defaultTechItems.length];
            return {
                id: item.id || idx + 1,
                title: item.title || defaultItem.title,
                subtitle: item.subtitle || defaultItem.subtitle,
                description: item.desc || item.description || defaultItem.description,
                year: item.year || defaultItem.year,
                location: item.location || defaultItem.location,
                image: item.image || getImage('technology', `item_${idx}`, defaultImages[idx % defaultImages.length]),
                subImages: item.subImages || defaultItem.subImages
            };
        })
        : defaultTechItems.map((item, idx) => ({
            ...item,
            image: getImage('technology', `item_${idx}`, defaultImages[idx % defaultImages.length])
        }));

    useEffect(() => {
        // Initial Entrance Animation
        const tl = gsap.timeline({
            onComplete: () => setIsLoaded(true)
        });

        tl.fromTo(initialCardRef.current,
            { scale: 0.5, opacity: 0, y: 100 },
            { scale: 1, opacity: 1, y: 0, duration: 1.2, ease: "power4.out" }
        )
            .to(initialCardRef.current, {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                delay: 1,
                ease: "power4.in"
            })
            .fromTo(".tech-marquee-container",
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
                "-=0.4"
            );

        // Marquee Animation
        const marquee = marqueeRef.current;
        if (marquee) {
            const totalWidth = marquee.scrollWidth / 2;
            marqueeTween.current = gsap.to(marquee, {
                x: -totalWidth,
                duration: 30,
                repeat: -1,
                ease: "none"
            });
        }

        return () => {
            if (marqueeTween.current) marqueeTween.current.kill();
        };
    }, [techItems.length]);

    useEffect(() => {
        if (marqueeTween.current) {
            if (hoveredItem !== null) {
                marqueeTween.current.pause();
                // Animate bottom text change
                gsap.fromTo(bottomTextRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                );
            } else {
                marqueeTween.current.play();
                // Animate back to mainTitle
                gsap.fromTo(bottomTextRef.current,
                    { y: -20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
                );
            }
        }
    }, [hoveredItem, mainTitle]);

    return (
        <div className="technology-page">
            {/* Initial Entrance Card */}
            {!isLoaded && (
                <div className="initial-card-overlay">
                    <div className="initial-card" ref={initialCardRef}>
                        <img src={techItems[0]?.image || buildingNight} alt="Tech" />
                        <div className="initial-card-text">
                            <span>{subtitle}</span>
                            <h2>{mainTitle}</h2>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Marquee Gallery */}
            <div className={`tech-marquee-container ${isLoaded ? 'visible' : ''}`}>
                <div className="tech-marquee-track" ref={marqueeRef}>
                    {[...techItems, ...techItems].map((item, index) => (
                        <div
                            key={`${item.id}-${index}`}
                            className={`tech-marquee-item ${hoveredItem?.id === item.id ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredItem(item)}
                            onMouseLeave={() => setHoveredItem(null)}
                        >
                            <div className="tech-item-inner">
                                <div className="tech-main-img">
                                    <img src={item.image} alt={item.title} />
                                    <div className="tech-item-overlay">
                                        <div className="tech-item-details">
                                            <span className="tech-item-year">{item.year}</span>
                                            <p className="tech-item-desc">{item.description}</p>
                                            <div className="tech-item-location">
                                                <span>Location:</span> {item.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Sub-images on Hover */}
                                <div className="tech-sub-images">
                                    {item.subImages.map((subImg, i) => (
                                        <div key={i} className="sub-img-wrapper" style={{ transitionDelay: `${i * 0.1}s` }}>
                                            <img src={subImg} alt="sub" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic Bottom Title */}
            <div className="tech-page-title">
                <h1 ref={bottomTextRef}>
                    {hoveredItem ? hoveredItem.title : mainTitle}
                </h1>
            </div>
        </div>
    );
};

export default Technology;
