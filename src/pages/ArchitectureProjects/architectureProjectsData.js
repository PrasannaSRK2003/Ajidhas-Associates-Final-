import arch1 from '../../assets/arch_project_1.png';
import arch2 from '../../assets/arch_project_2.png';
import villaSolenne from '../../assets/villa_solenne.png';
import villaLumiere from '../../assets/villa_lumiere.png';
import heroArch from '../../assets/hero_architecture.png';
import building1 from '../../assets/building1.png';
import penthouse from '../../assets/penthouse_reveal.png';
import abstractHero from '../../assets/abstract_architecture_hero.png';
import waitingHall from '../../assets/waiting_hall.jpeg';

const VIDEO_EXTENSIONS_RE = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

export const isVideoMediaUrl = (url) => {
    if (typeof url !== 'string') return false;
    return VIDEO_EXTENSIONS_RE.test(url.trim());
};

export const defaultArchitectureProjects = [
    {
        id: '1',
        category: 'Cultural Center',
        title: 'Casa Serena Cultural Pavilion',
        location: 'Barcelona, Spain',
        year: '2025',
        coords: '41.3851° N, 2.1734° E',
        designer: 'Ajidhas & Associates',
        description:
            'A minimalist sanctuary where natural daylight moves across sweeping architectural volumes. Warm stone plinths, cantilevered glass galleries, and serene reflecting courts unite civic openness with quiet intimacy.',
        mediaType: 'image',
        image: arch1,
        video: '',
        gallery: [
            { id: '1-g1', type: 'image', url: arch1, caption: 'Main Pavilion Facade' },
            { id: '1-g2', type: 'image', url: heroArch, caption: 'Entry Plaza & Canopy' },
            { id: '1-g3', type: 'image', url: waitingHall, caption: 'Sculpted Interior Atrium' },
            { id: '1-g4', type: 'image', url: abstractHero, caption: 'Roof Geometry Study' },
            { id: '1-g5', type: 'image', url: villaLumiere, caption: 'Courtyard Terrace' },
            { id: '1-g6', type: 'image', url: penthouse, caption: 'Upper Gallery Lounge' },
            { id: '1-g7', type: 'image', url: building1, caption: 'Structural Elevation' },
        ],
    },
    {
        id: '2',
        category: 'Residential',
        title: 'Skyline Residence',
        location: 'Dubai, UAE',
        year: '2025',
        coords: '25.2048° N, 55.2708° E',
        designer: 'Ajidhas & Associates',
        description:
            'Vertical living redefined through expansive acoustic glazing, shaded loggias, and passive cooling fins. Floor-to-ceiling apertures frame panoramic city horizons while maintaining calm domestic warmth.',
        mediaType: 'image',
        image: arch2,
        video: '',
        gallery: [
            { id: '2-g1', type: 'image', url: arch2, caption: 'Tower Silhouette' },
            { id: '2-g2', type: 'image', url: penthouse, caption: 'Double-Height Living Room' },
            { id: '2-g3', type: 'image', url: villaSolenne, caption: 'Terrace Overlook' },
            { id: '2-g4', type: 'image', url: waitingHall, caption: 'Lobby Stonework' },
            { id: '2-g5', type: 'image', url: heroArch, caption: 'Evening Illumination' },
            { id: '2-g6', type: 'image', url: arch1, caption: 'Facade Louver Detail' },
        ],
    },
    {
        id: '3',
        category: 'Hospitality',
        title: 'Forest Pavilion',
        location: 'Kyoto, Japan',
        year: '2024',
        coords: '35.0116° N, 135.7681° E',
        designer: 'Ajidhas & Associates',
        description:
            'Traditional timber joinery and moss stone gardens reimagined through a contemporary lens. Deep eaves filter woodland sunlight while shallow water channels bring quiet acoustic presence inside.',
        mediaType: 'image',
        image: villaSolenne,
        video: '',
        gallery: [
            { id: '3-g1', type: 'image', url: villaSolenne, caption: 'Woodland Approach' },
            { id: '3-g2', type: 'image', url: villaLumiere, caption: 'Reflecting Courtyard' },
            { id: '3-g3', type: 'image', url: building1, caption: 'Timber & Concrete Massing' },
            { id: '3-g4', type: 'image', url: waitingHall, caption: 'Tea Room Threshold' },
            { id: '3-g5', type: 'image', url: abstractHero, caption: 'Canopy Shadow Study' },
        ],
    },
    {
        id: '4',
        category: 'Cultural Center',
        title: 'Villa Lumiere Museum Annex',
        location: 'Provence, France',
        year: '2024',
        coords: '43.7031° N, 5.4500° E',
        designer: 'Ajidhas & Associates',
        description:
            'A contemporary exhibition hall anchored in limestone earthworks and folded roof planes, engineered to diffuse Mediterranean sun evenly across large-scale sculptural works.',
        mediaType: 'image',
        image: villaLumiere,
        video: '',
        gallery: [
            { id: '4-g1', type: 'image', url: villaLumiere, caption: 'South Elevation' },
            { id: '4-g2', type: 'image', url: arch1, caption: 'Gallery Skylight Axis' },
            { id: '4-g3', type: 'image', url: waitingHall, caption: 'Sculpture Hall' },
            { id: '4-g4', type: 'image', url: penthouse, caption: 'Reading Mezzanine' },
            { id: '4-g5', type: 'image', url: arch2, caption: 'North Courtyard' },
        ],
    },
];

const normalizeMediaEntry = (entry, idx, prefix = 'g') => {
    if (typeof entry === 'string') {
        const cleanUrl = entry.trim();
        if (!cleanUrl) return null;
        return {
            id: `${prefix}-${idx}`,
            type: isVideoMediaUrl(cleanUrl) ? 'video' : 'image',
            url: cleanUrl,
            caption: '',
        };
    }

    if (entry && typeof entry === 'object') {
        const cleanUrl = typeof entry.url === 'string'
            ? entry.url.trim()
            : (typeof entry.image === 'string' ? entry.image.trim() : '');
        if (!cleanUrl) return null;
        const explicitType = entry.type === 'video' || entry.type === 'image' ? entry.type : null;
        return {
            id: entry.id || `${prefix}-${idx}`,
            type: explicitType || (isVideoMediaUrl(cleanUrl) ? 'video' : 'image'),
            url: cleanUrl,
            caption: typeof entry.caption === 'string' ? entry.caption : '',
        };
    }

    return null;
};

const toList = (raw) => (
    Array.isArray(raw)
        ? raw
        : (raw && typeof raw === 'object' ? Object.values(raw) : [])
);

/**
 * Normalize WP CRM `architecture.projects` payload (including associative object edge cases)
 * into clean project records supporting multiple hero/showcase images & videos + gallery items.
 */
export const resolveArchitectureProjects = (wpContent) => {
    const rawProjects = wpContent?.architecture?.projects;
    const rawList = toList(rawProjects);

    if (rawList.length === 0) {
        return defaultArchitectureProjects.map((project) => ({
            ...project,
            textPosition: 'auto',
            showcaseSlides: [
                {
                    id: `${project.id}-hero`,
                    type: project.mediaType === 'video' && project.video ? 'video' : 'image',
                    url: project.mediaType === 'video' && project.video ? project.video : project.image,
                    poster: project.image,
                    caption: project.title,
                },
            ],
        }));
    }

    return rawList.map((item, idx) => {
        const fallback = defaultArchitectureProjects[idx % defaultArchitectureProjects.length];
        const rawImage = typeof item?.image === 'string' ? item.image.trim() : '';
        const rawVideo = typeof item?.video === 'string' ? item.video.trim() : '';
        const imageIsVideo = isVideoMediaUrl(rawImage);

        const resolvedVideo = rawVideo || (imageIsVideo ? rawImage : '');
        const resolvedImage = (!imageIsVideo && rawImage)
            ? rawImage
            : fallback.image;

        let mediaType = 'image';
        if (item?.media_type === 'video' && resolvedVideo) {
            mediaType = 'video';
        } else if (item?.media_type !== 'image' && resolvedVideo) {
            mediaType = 'video';
        }

        const primaryHeroSlide = {
            id: `${idx + 1}-hero`,
            type: mediaType === 'video' && resolvedVideo ? 'video' : 'image',
            url: mediaType === 'video' && resolvedVideo ? resolvedVideo : resolvedImage,
            poster: resolvedImage,
            caption: item?.title || fallback.title,
        };

        const extraHeroSlides = toList(item?.hero_slides)
            .map((entry, sIdx) => normalizeMediaEntry(entry, sIdx, `${idx + 1}-s`))
            .filter(Boolean)
            .map((slide) => ({ ...slide, poster: resolvedImage }));

        // Deduplicate primary hero media + additional showcase slides for the same project
        const hasExplicitHeroInput = Boolean(rawImage || rawVideo);
        const showcaseSlides = extraHeroSlides.length > 0
            ? (hasExplicitHeroInput && !extraHeroSlides.some((s) => s.url === primaryHeroSlide.url)
                ? [primaryHeroSlide, ...extraHeroSlides]
                : extraHeroSlides)
            : [primaryHeroSlide];

        const normalizedGallery = toList(item?.gallery)
            .map((entry, gIdx) => normalizeMediaEntry(entry, gIdx, `${idx + 1}-g`))
            .filter(Boolean);

        let gallery = normalizedGallery;
        if (gallery.length === 0) {
            const seedUrls = new Set(showcaseSlides.map((s) => s.url));
            const supplement = fallback.gallery.filter((g) => !seedUrls.has(g.url));
            gallery = [...showcaseSlides, ...supplement];
        }

        const primarySlide = showcaseSlides[0] || primaryHeroSlide;

        return {
            id: String(item?.id || idx + 1),
            category: (typeof item?.category === 'string' && item.category.trim())
                ? item.category.trim()
                : fallback.category,
            title: (typeof item?.title === 'string' && item.title.trim())
                ? item.title.trim()
                : fallback.title,
            location: (typeof item?.location === 'string' && item.location.trim())
                ? item.location.trim()
                : fallback.location,
            year: (typeof item?.year === 'string' && item.year.trim())
                ? item.year.trim()
                : fallback.year,
            coords: (typeof item?.coords === 'string' && item.coords.trim())
                ? item.coords.trim()
                : fallback.coords,
            designer: (typeof item?.designer === 'string' && item.designer.trim())
                ? item.designer.trim()
                : fallback.designer,
            description: (typeof item?.description === 'string' && item.description.trim())
                ? item.description.trim()
                : ((typeof item?.desc === 'string' && item.desc.trim()) ? item.desc.trim() : fallback.description),
            textPosition: (item?.text_position === 'left' || item?.text_position === 'right')
                ? item.text_position
                : 'auto',
            mediaType: primarySlide.type,
            image: primarySlide.type === 'image' ? primarySlide.url : resolvedImage,
            video: primarySlide.type === 'video' ? primarySlide.url : resolvedVideo,
            showcaseSlides,
            gallery,
        };
    });
};

