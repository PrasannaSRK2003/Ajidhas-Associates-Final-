import React, { useState, useEffect } from 'react';
import { fetchSiteContent, fetchProjects, submitInquiry } from '../services/api';
import ContentContext from './contentContextValue';

const ContentProvider = ({ children }) => {
    const [wpContent, setWpContent] = useState(() => {
        try {
            const cached = localStorage.getItem('ajidhas_wp_content');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });

    const [wpProjects, setWpProjects] = useState(() => {
        try {
            const cached = localStorage.getItem('ajidhas_wp_projects');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(!wpContent);

    useEffect(() => {
        let isMounted = true;
        const loadAllData = async () => {
            const [contentData, projectsData] = await Promise.all([
                fetchSiteContent(),
                fetchProjects()
            ]);
            if (isMounted) {
                if (contentData) {
                    setWpContent(contentData);
                    try {
                        localStorage.setItem('ajidhas_wp_content', JSON.stringify(contentData));
                    } catch {
                        // Cached content is optional; keep the in-memory result.
                    }
                }
                if (projectsData && projectsData.length > 0) {
                    setWpProjects(projectsData);
                    try {
                        localStorage.setItem('ajidhas_wp_projects', JSON.stringify(projectsData));
                    } catch {
                        // Cached projects are optional; keep the in-memory result.
                    }
                }
                setLoading(false);
            }
        };

        loadAllData();
        return () => { isMounted = false; };
    }, []);

    /**
     * Get dynamic text with fallback
     * @param {string} section - e.g. 'home', 'general', 'about', 'contact'
     * @param {string} key - e.g. 'hero_title', 'contact_email'
     * @param {string} fallback - local fallback string
     */
    const getText = (section, key, fallback = '') => {
        if (wpContent && wpContent[section] && wpContent[section][key]) {
            return wpContent[section][key];
        }
        return fallback;
    };

    /**
     * Get dynamic image or background image with fallback
     * @param {string} section - e.g. 'home', 'architecture', 'contact'
     * @param {string|number} keyOrIndex - e.g. 'bg_image' or 0, 1, 2 for array
     * @param {string} fallbackImg - imported local image asset
     */
    const getImage = (section, keyOrIndex, fallbackImg) => {
        if (!wpContent || !wpContent[section]) return fallbackImg;

        const val = wpContent[section];
        if (typeof keyOrIndex === 'number' && Array.isArray(val?.bg_images)) {
            return val.bg_images[keyOrIndex] || fallbackImg;
        }

        if (typeof keyOrIndex === 'string' && val[keyOrIndex]) {
            return val[keyOrIndex];
        }

        return fallbackImg;
    };

    /**
     * Get dynamic team members array with fallback
     */
    const getTeam = (fallbackTeam = []) => {
        if (wpContent?.about?.team && Array.isArray(wpContent.about.team) && wpContent.about.team.length > 0) {
            return wpContent.about.team.map((member, idx) => ({
                id: idx + 1,
                name: member.name || fallbackTeam[idx]?.name || 'Team Member',
                role: member.role || fallbackTeam[idx]?.role || 'Architect',
                image: member.image || fallbackTeam[idx]?.image,
                bio: member.bio || fallbackTeam[idx]?.bio || ''
            }));
        }
        return fallbackTeam;
    };

    return (
        <ContentContext.Provider value={{
            wpContent,
            wpProjects,
            loading,
            getText,
            getImage,
            getTeam,
            submitInquiry
        }}>
            {children}
        </ContentContext.Provider>
    );
};

export { ContentProvider };
