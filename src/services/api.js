// API Service for Headless WordPress CRM & Content Integration

const WP_API_URL = import.meta.env.VITE_WP_API_URL || 'https://jeeshnuajidhas.com/wp-json/ajidhas/v1';

/**
 * Fetch all dynamic site text, images, and background image mappings from WordPress
 */
export const fetchSiteContent = async () => {
    try {
        const response = await fetch(`${WP_API_URL}/content?_t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json?.data || null;
    } catch (error) {
        console.warn('WordPress API offline or unreachable. Using default site assets:', error.message);
        return null; // Fallback to default local content seamlessly
    }
};

/**
 * Fetch custom portfolio projects from WordPress
 */
export const fetchProjects = async () => {
    try {
        const response = await fetch(`${WP_API_URL}/projects?_t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        return json?.projects || [];
    } catch (error) {
        console.warn('WordPress Projects API offline. Using fallback projects:', error.message);
        return [];
    }
};

/**
 * Submit client lead inquiry form to WordPress CRM
 * @param {Object} formData - { name, email, phone, subject, message, type }
 */
export const submitInquiry = async (formData) => {
    try {
        const response = await fetch(`${WP_API_URL}/inquiry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Submission failed');
        }

        return result;
    } catch (error) {
        console.error('Inquiry Submission Error:', error);
        throw error;
    }
};
