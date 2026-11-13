import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    IoArrowBackOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoCloseOutline,
    IoPlayCircleOutline,
} from 'react-icons/io5';
import { useContent } from '../../context/useContent';
import { resolveArchitectureProjects } from './architectureProjectsData';
import './ArchitectureProjectsDetail.css';

const ProjectDetailView = ({ project, allProjects }) => {
    const navigate = useNavigate();
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const gallery = project.gallery && project.gallery.length > 0
        ? project.gallery
        : [{ id: 'fallback-hero', type: project.mediaType, url: project.video || project.image, caption: project.title }];

    const safeIndex = activeMediaIndex < gallery.length ? activeMediaIndex : 0;
    const activeMedia = gallery[safeIndex] || gallery[0];

    const visibleThumbs = gallery.slice(0, 5);
    const extraCount = Math.max(0, gallery.length - 5);

    const otherProjects = useMemo(
        () => allProjects.filter((item) => item.id !== project.id),
        [allProjects, project.id]
    );

    const featuredSidebarProjects = otherProjects.slice(0, 2);
    const sameCategoryProjects = otherProjects.filter(
        (item) => item.category.toLowerCase() === project.category.toLowerCase()
    );
    const moreProjects = (sameCategoryProjects.length > 0
        ? sameCategoryProjects
        : otherProjects.slice(2)
    );
    const fallbackMoreProjects = moreProjects.length > 0 ? moreProjects : otherProjects;
    const moreHeading = sameCategoryProjects.length > 0
        ? `MORE ${project.category.toUpperCase()}`
        : 'MORE ARCHITECTURE';

    const showPrevMedia = () => {
        if (gallery.length < 2) return;
        setActiveMediaIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    };

    const showNextMedia = () => {
        if (gallery.length < 2) return;
        setActiveMediaIndex((prev) => (prev + 1) % gallery.length);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [project.id]);

    useEffect(() => {
        if (!lightboxOpen) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setLightboxOpen(false);
            } else if (event.key === 'ArrowLeft' && gallery.length > 1) {
                setActiveMediaIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
            } else if (event.key === 'ArrowRight' && gallery.length > 1) {
                setActiveMediaIndex((prev) => (prev + 1) % gallery.length);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [lightboxOpen, gallery.length]);

    const renderSidebarCard = (item) => {
        const thumbSrc = item.image || (item.gallery?.[0]?.type === 'image' ? item.gallery[0].url : '');
        const isVideoOnly = !thumbSrc && item.video;

        return (
            <button
                key={item.id}
                type="button"
                className="arch-sidebar-project"
                onClick={() => navigate(`/architecture/projects/${item.id}`)}
            >
                <div className="arch-sidebar-thumb">
                    {isVideoOnly ? (
                        <video src={item.video} muted playsInline preload="metadata" />
                    ) : (
                        <img src={thumbSrc} alt={item.title} loading="lazy" />
                    )}
                </div>
                <div className="arch-sidebar-info">
                    <span className="arch-sidebar-title">
                        {item.title} / {item.designer}
                    </span>
                    <span className="arch-sidebar-sub">
                        {item.location} &middot; {item.year}
                    </span>
                </div>
            </button>
        );
    };

    return (
        <div className="arch-showcase-detail">
            <div className="arch-detail-shell">
                {/* Main Left Column */}
                <div className="arch-detail-main">
                    <div className="arch-gallery-stage-wrap">
                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="arch-stage-arrow arch-stage-arrow--prev"
                                aria-label="Previous media"
                                onClick={showPrevMedia}
                            >
                                <IoChevronBackOutline aria-hidden="true" />
                            </button>
                        )}

                        <div className="arch-gallery-stage">
                            {activeMedia.type === 'video' ? (
                                <video
                                    key={activeMedia.url}
                                    className="arch-stage-media"
                                    src={activeMedia.url}
                                    poster={project.image}
                                    controls
                                    autoPlay
                                    muted
                                    playsInline
                                />
                            ) : (
                                <button
                                    type="button"
                                    className="arch-stage-zoom-btn"
                                    aria-label="Open full gallery view"
                                    onClick={() => setLightboxOpen(true)}
                                >
                                    <img
                                        className="arch-stage-media"
                                        src={activeMedia.url}
                                        alt={activeMedia.caption || project.title}
                                    />
                                </button>
                            )}

                            <span className="arch-stage-copyright" aria-hidden="true">
                                &copy;
                            </span>
                        </div>

                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="arch-stage-arrow arch-stage-arrow--next"
                                aria-label="Next media"
                                onClick={showNextMedia}
                            >
                                <IoChevronForwardOutline aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    {/* 5-Thumbnail Strip */}
                    <div className="arch-thumb-strip" role="list" aria-label="Project gallery thumbnails">
                        {visibleThumbs.map((media, index) => {
                            const isLastWithMore = index === 4 && extraCount > 0;
                            const isSelected = index === safeIndex;

                            return (
                                <button
                                    key={media.id || index}
                                    type="button"
                                    className={`arch-thumb-btn${isSelected ? ' is-selected' : ''}`}
                                    aria-label={
                                        isLastWithMore
                                            ? `View all ${gallery.length} media items`
                                            : `Show media ${index + 1}`
                                    }
                                    onClick={() => {
                                        if (isLastWithMore) {
                                            setActiveMediaIndex(index);
                                            setLightboxOpen(true);
                                        } else {
                                            setActiveMediaIndex(index);
                                        }
                                    }}
                                >
                                    {media.type === 'video' ? (
                                        <>
                                            <video src={media.url} muted playsInline preload="metadata" />
                                            <span className="arch-thumb-video-icon" aria-hidden="true">
                                                <IoPlayCircleOutline />
                                            </span>
                                        </>
                                    ) : (
                                        <img src={media.url} alt={media.caption || `${project.title} ${index + 1}`} />
                                    )}

                                    {isLastWithMore && (
                                        <span className="arch-thumb-more-overlay">
                                            + {extraCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Editorial Project Copy & Metadata */}
                    <article className="arch-detail-article">
                        <div className="arch-detail-article-top">
                            <Link to="/architecture/projects" className="arch-detail-back-link">
                                <IoArrowBackOutline aria-hidden="true" />
                                <span>All Architecture Projects</span>
                            </Link>
                            <span className="arch-detail-category-badge">{project.category}</span>
                        </div>

                        <h1>{project.title}</h1>

                        <dl className="arch-detail-specs-bar">
                            <div>
                                <dt>Architect</dt>
                                <dd>{project.designer}</dd>
                            </div>
                            <div>
                                <dt>Location</dt>
                                <dd>{project.location}</dd>
                            </div>
                            <div>
                                <dt>Year</dt>
                                <dd>{project.year}</dd>
                            </div>
                            {project.coords && (
                                <div>
                                    <dt>Coordinates</dt>
                                    <dd>{project.coords}</dd>
                                </div>
                            )}
                        </dl>

                        <p className="arch-detail-narrative">{project.description}</p>
                    </article>
                </div>

                {/* Right Sidebar Column (Featured & More Category Projects) */}
                <aside className="arch-detail-sidebar" aria-label="Related architecture projects">
                    {featuredSidebarProjects.length > 0 && (
                        <div className="arch-sidebar-featured-box">
                            {featuredSidebarProjects.map(renderSidebarCard)}
                        </div>
                    )}

                    {fallbackMoreProjects.length > 0 && (
                        <div className="arch-sidebar-more-section">
                            <h2 className="arch-sidebar-more-heading">{moreHeading}</h2>
                            <div className="arch-sidebar-more-list">
                                {fallbackMoreProjects.map(renderSidebarCard)}
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Full Gallery Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="arch-lightbox-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${project.title} gallery`}
                    onClick={(event) => {
                        if (event.target === event.currentTarget) setLightboxOpen(false);
                    }}
                >
                    <button
                        type="button"
                        className="arch-lightbox-close"
                        aria-label="Close gallery"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <IoCloseOutline aria-hidden="true" />
                    </button>

                    <div className="arch-lightbox-stage">
                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="arch-lightbox-nav arch-lightbox-nav--prev"
                                aria-label="Previous item"
                                onClick={showPrevMedia}
                            >
                                <IoChevronBackOutline aria-hidden="true" />
                            </button>
                        )}

                        <div className="arch-lightbox-media-box">
                            {activeMedia.type === 'video' ? (
                                <video
                                    key={activeMedia.url}
                                    src={activeMedia.url}
                                    poster={project.image}
                                    controls
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={activeMedia.url}
                                    alt={activeMedia.caption || project.title}
                                />
                            )}
                            <div className="arch-lightbox-caption">
                                <span>{activeMedia.caption || project.title}</span>
                                <span>
                                    {safeIndex + 1} / {gallery.length}
                                </span>
                            </div>
                        </div>

                        {gallery.length > 1 && (
                            <button
                                type="button"
                                className="arch-lightbox-nav arch-lightbox-nav--next"
                                aria-label="Next item"
                                onClick={showNextMedia}
                            >
                                <IoChevronForwardOutline aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ArchitectureProjectsDetail = () => {
    const { id } = useParams();
    const { wpContent } = useContent();
    const projects = useMemo(() => resolveArchitectureProjects(wpContent), [wpContent]);

    const currentProject = useMemo(() => {
        const byId = projects.find((item) => String(item.id) === String(id));
        if (byId) return byId;
        const parsedIdx = Number.parseInt(id, 10) - 1;
        if (!Number.isNaN(parsedIdx) && projects[parsedIdx]) return projects[parsedIdx];
        return projects[0];
    }, [projects, id]);

    if (!currentProject) return null;

    return (
        <ProjectDetailView
            key={currentProject.id}
            project={currentProject}
            allProjects={projects}
        />
    );
};

export default ArchitectureProjectsDetail;

