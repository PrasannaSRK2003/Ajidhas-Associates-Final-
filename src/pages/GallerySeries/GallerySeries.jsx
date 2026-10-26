import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../context/useContent';
import './GallerySeries.css';

import art1 from '../../assets/art_1.png';
import art2 from '../../assets/art_2.png';
import art3 from '../../assets/art_3.png';

const defaultGalleryImages = [
    { id: 1, title: 'Hatha Yoga', label: 'Series 01', image: art1 },
    { id: 2, title: 'Vinyasa Yoga', label: 'Series 02', image: art2 },
    { id: 3, title: 'Ashtanga Yoga', label: 'Series 03', image: art3 },
    { id: 4, title: 'Yin Yoga', label: 'Series 04', image: art1 },
    { id: 5, title: 'Kundalini Yoga', label: 'Series 05', image: art2 },
    { id: 6, title: 'Restorative Yoga', label: 'Series 06', image: art3 },
];

const GallerySeries = () => {
    const navigate = useNavigate();
    const { getText, getImage, wpContent } = useContent();
    const [isPaused, setIsPaused] = useState(false);

    const headerLabel = getText('gallery', 'header_label', 'Gallery');
    const headerTitle = getText('gallery', 'header_title', 'Artistic Series');
    const footerHint = getText('gallery', 'footer_hint', 'Scroll to explore');

    const galleryImages = (wpContent?.gallery?.items && Array.isArray(wpContent.gallery.items) && wpContent.gallery.items.length > 0)
        ? wpContent.gallery.items.map((item, idx) => ({
            id: item.id || idx + 1,
            title: item.title || defaultGalleryImages[idx % defaultGalleryImages.length]?.title || `Series ${idx + 1}`,
            label: item.label || defaultGalleryImages[idx % defaultGalleryImages.length]?.label || `Series ${(idx + 1).toString().padStart(2, '0')}`,
            image: item.image || getImage('gallery', idx, defaultGalleryImages[idx % defaultGalleryImages.length]?.image || art1)
        }))
        : defaultGalleryImages.map((item, idx) => ({
            ...item,
            image: getImage('gallery', idx, item.image)
        }));

    // Duplicate images for seamless infinite 3D loop track
    const displayImages = [...galleryImages, ...galleryImages];

    return (
        <div className="gallery-page-container">
            <header className="gallery-header">
                <div className="header-text">
                    <span className="header-label">{headerLabel}</span>
                    <h1 className="header-title">{headerTitle}</h1>
                </div>
            </header>

            <div className="gallery-3d-viewport">
                <div
                    className={`gallery-3d-track ${isPaused ? 'paused' : ''}`}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {displayImages.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="gallery-card-container">
                            <div
                                className="gallery-card"
                                onClick={() => navigate(`/art/preview/${item.id}`)}
                            >
                                <div className="card-image-box">
                                    <img src={item.image} alt={item.title} />
                                    <div className="card-overlay"></div>
                                    <div className="card-content">
                                        <span className="card-label">{item.label}</span>
                                        <h3 className="card-title">{item.title}</h3>
                                    </div>
                                    <div className="card-reflection"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="gallery-footer">
                <div className="scroll-indicator">
                    <div className="indicator-line"></div>
                    <span>{footerHint}</span>
                </div>
            </div>
        </div>
    );
};

export default GallerySeries;
