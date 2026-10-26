import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { IoClose } from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import './Landscape.css';

import bg1 from '../../assets/hero_bg_night.png';
import bg2 from '../../assets/hero_bg_architecture.png';
import bg3 from '../../assets/home_bg.png';
import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';

const defaultClusterItems = [
    { id: 1, title: "Silent Peaks", desc: "A serene exploration of mountain architecture.", location: "Switzerland", year: "2024", type: "Landscape", photographer: "Marcel E.", width: 220, height: 280, top: '10%', left: '5%' },
    { id: 2, title: "Urban Flow", desc: "Capturing the movement of city life.", location: "Tokyo, Japan", year: "2024", type: "Landscape", photographer: "Kenji T.", width: 260, height: 180, top: '25%', left: '45%' },
    { id: 3, title: "Desert Mirage", desc: "Heat and light playing tricks on the eye.", location: "Dubai, UAE", year: "2023", type: "Landscape", photographer: "Sarah K.", width: 200, height: 200, top: '60%', left: '15%' },
    { id: 4, title: "Forest Edge", desc: "Where nature meets structure.", location: "Black Forest, Germany", year: "2024", type: "Landscape", photographer: "Hans M.", width: 240, height: 300, top: '50%', left: '70%' },
    { id: 5, title: "Ocean View", desc: "Infinite horizons and calming blues.", location: "Malibu, CA", year: "2025", type: "Landscape", photographer: "David R.", width: 180, height: 220, top: '15%', left: '80%' },
    { id: 6, title: "Night Lights", desc: "The city comes alive after dark.", location: "Singapore", year: "2024", type: "Landscape", photographer: "Elena S.", width: 200, height: 160, top: '75%', left: '40%' },
];

const defaultImages = [bg1, bg2, bg3, art1, art2];

const Landscape = () => {
    const trackRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const modalImgRef = useRef(null);
    const modalDetailsRef = useRef(null);
    const { getText, getImage, wpContent } = useContent();

    const title = getText('landscape', 'header_title', 'Landscape');

    const clusterItems = (wpContent?.landscape?.items && Array.isArray(wpContent.landscape.items) && wpContent.landscape.items.length > 0)
        ? wpContent.landscape.items.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultClusterItems[idx % defaultClusterItems.length]?.title || `Landscape ${idx + 1}`,
            desc: item.desc || defaultClusterItems[idx % defaultClusterItems.length]?.desc || 'A landscape architectural study.',
            location: item.location || defaultClusterItems[idx % defaultClusterItems.length]?.location || 'Switzerland',
            year: item.year || defaultClusterItems[idx % defaultClusterItems.length]?.year || '2024',
            type: item.type || defaultClusterItems[idx % defaultClusterItems.length]?.type || 'Landscape',
            photographer: item.photographer || defaultClusterItems[idx % defaultClusterItems.length]?.photographer || 'Marcel E.',
            width: item.width || defaultClusterItems[idx % defaultClusterItems.length]?.width || 220,
            height: item.height || defaultClusterItems[idx % defaultClusterItems.length]?.height || 240,
            top: item.top || defaultClusterItems[idx % defaultClusterItems.length]?.top || '20%',
            left: item.left || defaultClusterItems[idx % defaultClusterItems.length]?.left || '20%',
            image: item.image || getImage('landscape', `card_${idx}`, defaultImages[idx % defaultImages.length])
        }))
        : defaultClusterItems.map((item, idx) => ({
            ...item,
            image: getImage('landscape', `card_${idx}`, defaultImages[idx % defaultImages.length])
        }));

    useEffect(() => {
        // Marquee Animation
        const track = trackRef.current;
        if (!track) return;
        const totalWidth = track.scrollWidth / 2;

        gsap.set(track, { x: 0 });

        const marquee = gsap.to(track, {
            x: -totalWidth,
            duration: 30,
            ease: "none",
            repeat: -1,
            modifiers: {
                x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
            }
        });

        // Floating Animation for individual items
        const items = document.querySelectorAll('.land-item');
        items.forEach((item) => {
            gsap.to(item, {
                y: '+=15',
                duration: 2 + Math.random() * 2,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut',
                delay: Math.random()
            });
        });

        return () => {
            marquee.kill();
        };
    }, [clusterItems.length]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        const tl = gsap.timeline({
            onComplete: () => setSelectedItem(null)
        });
        tl.to([modalImgRef.current, modalDetailsRef.current], {
            y: 30,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in'
        });
    };

    useEffect(() => {
        if (selectedItem) {
            const tl = gsap.timeline();
            tl.to(modalImgRef.current, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power3.out',
                delay: 0.1
            })
                .to(modalDetailsRef.current, {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power3.out'
                }, '-=0.4');
        }
    }, [selectedItem]);

    return (
        <div className="landscape-container">
            <div className="land-center-content">
                <h1 className="land-title">{title}</h1>
            </div>

            <div className="land-marquee-wrapper">
                <div className="land-track" ref={trackRef}>
                    {[0, 1, 2].map((setIndex) => (
                        <div key={setIndex} className="land-cluster">
                            {clusterItems.map((item) => (
                                <div
                                    key={`${setIndex}-${item.id}`}
                                    className="land-item"
                                    style={{
                                        width: `${item.width}px`,
                                        height: `${item.height}px`,
                                        top: item.top,
                                        left: item.left,
                                    }}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <img src={item.image} alt={item.title} />
                                    <div className="land-item-overlay">
                                        <span className="land-item-title">{item.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Full Screen Modal */}
            <div className={`land-modal ${selectedItem ? 'active' : ''}`}>
                {selectedItem && (
                    <>
                        <img src={selectedItem.image} alt="bg" className="land-modal-bg" />
                        <button className="land-modal-close" onClick={handleCloseModal}>
                            <IoClose />
                        </button>
                        <div className="land-modal-content">
                            <div className="land-modal-inner">
                                <div className="land-modal-img-wrapper" ref={modalImgRef}>
                                    <img src={selectedItem.image} alt={selectedItem.title} />
                                </div>
                                <div className="land-modal-details" ref={modalDetailsRef}>
                                    <h2 className="land-modal-title">{selectedItem.title}</h2>
                                    <p className="land-modal-desc">{selectedItem.desc}</p>
                                    <div className="land-modal-meta">
                                        <div className="land-meta-item">
                                            <h4>Location</h4>
                                            <p>{selectedItem.location || 'Switzerland'}</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Year</h4>
                                            <p>{selectedItem.year || '2024'}</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Type</h4>
                                            <p>{selectedItem.type || 'Landscape'}</p>
                                        </div>
                                        <div className="land-meta-item">
                                            <h4>Photographer</h4>
                                            <p>{selectedItem.photographer || 'Marcel E.'}</p>
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

export default Landscape;
