<?php
/**
 * Plugin Name: Ajidhas & Associates CRM & Headless Content Manager
 * Plugin URI: https://ajidhasassociates.com
 * Description: Complete Headless CMS & Lead CRM solution for Ajidhas & Associates. Manage all site section text, images, background images, portfolio projects, and client inquiries from WordPress.
 * Version: 1.2.0
 * Author: Ajidhas & Associates
 * Author URI: https://ajidhasassociates.com
 * Text Domain: ajidhas-crm
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class Ajidhas_CRM_Content_Manager {

    private static $instance = null;
    private $option_key = 'ajidhas_site_content';

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        // Activation & Deactivation Hooks
        register_activation_hook(__FILE__, array($this, 'activate_plugin'));

        // Admin & REST API Actions
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('init', array($this, 'register_custom_post_types'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_action('rest_api_init', array($this, 'setup_cors_headers'), 15);
        add_filter('rest_pre_serve_request', array($this, 'handle_cors_preflight'));
    }

    /**
     * Plugin Activation Routine
     */
    public function activate_plugin() {
        $this->register_custom_post_types();
        $this->create_inquiries_db_table();
        $this->seed_default_content();
        flush_rewrite_rules();
    }

    /**
     * Create Custom Inquiries Table for Lead CRM
     */
    private function create_inquiries_db_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            phone varchar(50) DEFAULT '',
            subject varchar(255) DEFAULT '',
            message text NOT NULL,
            type varchar(50) DEFAULT 'general',
            status varchar(50) DEFAULT 'new',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Get Default Content Structure for All Sections
     */
    public function get_default_content() {
        return array(
            'general' => array(
                'site_title' => 'Ajidhas and Associates',
                'site_subtitle' => 'Architecture & Art Studio',
                'logo_url' => '',
                'contact_email' => 'ajidhassandassociates@gmail.com',
                'contact_phone' => '+91 9790847621',
                'contact_address' => "Chennai, India\nAvailable Worldwide",
                'footer_copyright' => '© 2026 Ajidhas & Associates. All rights reserved.',
            ),
            'home' => array(
                'hero_title' => 'Ajidhas and Associates',
                'hero_subtitle' => 'Architecture & Art Studio',
                'bg_image' => '',
                'art_button_text' => 'Art',
                'architecture_button_text' => 'Architecture',
            ),
            'architecture' => array(
                'header_title' => 'Architecture',
                'subtitle' => 'Timeless spatial forms, sustainable engineering, and human-centric living.',
                'bg_images' => array('', '', ''),
                'projects' => array(
                    array(
                        'title' => 'casa serena',
                        'location' => 'BARCELONA',
                        'year' => '2025',
                        'coords' => '41.3851° N, 2.1734° E',
                        'description' => 'a minimalist sanctuary where light dances through geometric volumes. clean lines meet warm materials in perfect harmony',
                        'designer' => 'ANTONI MARTÍNEZ',
                        'image' => ''
                    ),
                    array(
                        'title' => 'skyline residence',
                        'location' => 'DUBAI',
                        'year' => '2025',
                        'coords' => '25.2048° N, 55.2708° E',
                        'description' => 'vertical living redefined. floor-to-ceiling glass frames the city below, while sustainable design meets luxury',
                        'designer' => 'FATIMA AL-RASHID',
                        'image' => ''
                    ),
                    array(
                        'title' => 'forest pavilion',
                        'location' => 'KYOTO',
                        'year' => '2024',
                        'coords' => '35.0116° N, 135.7681° E',
                        'description' => 'traditional japanese aesthetics reimagined. natural wood, stone gardens, and the gentle sound of water',
                        'designer' => 'KENJI TANAKA',
                        'image' => ''
                    ),
                )
            ),
            'art' => array(
                'header_label' => 'Art Collection',
                'header_title' => 'Ajidhas & Associates',
                'header_subtitle' => 'Curated works from visionary artists',
                'subtitle' => 'Exploring the Boundaries of Space, Light & Form',
                'bg_image' => '',
                'artist_name' => 'Ajidhas',
                'artist_role' => 'Principal Artist & Architect',
                'artist_bio' => 'Blending architectural precision with abstract expressionism.',
                'artist_image' => '',
                'items' => array(
                    array('title' => 'Ethereal Silence', 'artist' => 'Ajidhas', 'year' => '2025', 'medium' => 'Mixed Media on Canvas', 'image' => ''),
                    array('title' => 'Bronze Form No. 4', 'artist' => 'Ajidhas', 'year' => '2024', 'medium' => 'Bronze Sculpture', 'image' => ''),
                    array('title' => 'Monolith', 'artist' => 'Ajidhas', 'year' => '2025', 'medium' => 'Photography', 'image' => ''),
                )
            ),
            'gallery' => array(
                'header_label' => 'Gallery',
                'header_title' => 'Artistic Series',
                'footer_hint' => 'Scroll to explore',
                'items' => array(
                    array('title' => 'Hatha Yoga', 'label' => 'Series 01', 'image' => ''),
                    array('title' => 'Vinyasa Yoga', 'label' => 'Series 02', 'image' => ''),
                    array('title' => 'Ashtanga Yoga', 'label' => 'Series 03', 'image' => ''),
                    array('title' => 'Yin Yoga', 'label' => 'Series 04', 'image' => ''),
                    array('title' => 'Kundalini Yoga', 'label' => 'Series 05', 'image' => ''),
                    array('title' => 'Restorative Yoga', 'label' => 'Series 06', 'image' => ''),
                )
            ),
            'architecture_all' => array(
                'header_title' => 'ALL WORK',
                'projects' => array(
                    array('title' => 'The Nexus Tower', 'desc' => 'A vertical city within a city, redefining urban living with sustainable innovation.', 'location' => 'Europe', 'year' => '2024', 'status' => 'Completed', 'type' => 'Commercial', 'image' => ''),
                    array('title' => 'Horizon House', 'desc' => 'Where earth meets sky. A cantilevered masterpiece suspended over the valley.', 'location' => 'Asia', 'year' => '2024', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                    array('title' => 'Aqua Residence', 'desc' => 'Fluid architecture inspired by water. Curves and reflections create a living sculpture.', 'location' => 'Americas', 'year' => '2025', 'status' => 'In Design', 'type' => 'Residential', 'image' => ''),
                    array('title' => 'The Void Gallery', 'desc' => 'Negative space becomes the artwork. A museum that celebrates emptiness.', 'location' => 'Europe', 'year' => '2023', 'status' => 'Completed', 'type' => 'Cultural', 'image' => ''),
                    array('title' => 'Copper Sanctuary', 'desc' => 'Oxidized metal meets sacred geometry in this meditation retreat.', 'location' => 'Asia', 'year' => '2024', 'status' => 'Completed', 'type' => 'Hospitality', 'image' => ''),
                    array('title' => 'Crystal Pavilion', 'desc' => 'Transparent walls dissolve boundaries between nature and architecture.', 'location' => 'Europe', 'year' => '2025', 'status' => 'Under Construction', 'type' => 'Public', 'image' => ''),
                    array('title' => 'Midnight Studios', 'desc' => 'Creative spaces bathed in controlled darkness and dramatic light.', 'location' => 'Americas', 'year' => '2024', 'status' => 'Completed', 'type' => 'Studio', 'image' => ''),
                    array('title' => 'Bamboo Residence', 'desc' => 'Sustainable living through traditional materials and modern design.', 'location' => 'Asia', 'year' => '2023', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                    array('title' => 'Cliffside Villa', 'desc' => 'Perched on the edge of possibility, embracing the dramatic landscape.', 'location' => 'Europe', 'year' => '2025', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                    array('title' => 'Concrete Poetry', 'desc' => 'Brutalist forms softened by natural light and green terraces.', 'location' => 'Europe', 'year' => '2024', 'status' => 'Completed', 'type' => 'Mixed Use', 'image' => ''),
                    array('title' => 'White Cube Loft', 'desc' => 'Pure minimalism. Every element serves a purpose, nothing more.', 'location' => 'Americas', 'year' => '2023', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                    array('title' => 'Garden Bridge House', 'desc' => 'A living connection between two hillsides, wrapped in vegetation.', 'location' => 'Asia', 'year' => '2025', 'status' => 'In Design', 'type' => 'Residential', 'image' => ''),
                )
            ),
            'about' => array(
                'header_title' => 'About Our Studio',
                'studio_description' => 'A collective of visionary architects, designers, and artists crafting timeless environments.',
                'team' => array(
                    array('name' => 'Ajidhas', 'role' => 'Principal Architect', 'image' => '', 'bio' => 'A visionary leader with over 15 years of experience in sustainable urban design.'),
                    array('name' => 'Pradeep', 'role' => 'Creative Director', 'image' => '', 'bio' => 'Pradeep brings a unique artistic perspective to every project.'),
                    array('name' => 'Sarah Chen', 'role' => 'Lead Designer', 'image' => '', 'bio' => 'Sarah specializes in minimalist residential architecture.'),
                    array('name' => 'Marcus Vane', 'role' => 'Technical Lead', 'image' => '', 'bio' => 'Marcus bridges the gap between complex engineering and architectural beauty.')
                )
            ),
            'visualisation' => array(
                'header_title' => 'Visualisation & 3D Renders',
                'subtitle' => 'Hyper-realistic digital spaces and architectural storytelling.',
                'bg_image' => '',
                'items' => array(
                    array('title' => 'Haus am See', 'category' => 'RESIDENTIAL', 'desc' => 'A minimalist retreat nestled by the serene waters, blending modern geometry with natural tranquility.', 'image' => ''),
                    array('title' => 'Urban Loft', 'category' => 'PROPERTY', 'desc' => 'Sophisticated industrial living in the heart of the city, featuring open spaces and raw material palettes.', 'image' => ''),
                    array('title' => 'Alpine Retreat', 'category' => 'HOSPITALITY', 'desc' => 'Luxury mountain lodging designed to withstand the elements while providing unparalleled warmth and comfort.', 'image' => ''),
                    array('title' => 'Tech Hub', 'category' => 'CORPORATE', 'desc' => 'A futuristic workspace fostering innovation through dynamic architecture and integrated technology.', 'image' => ''),
                    array('title' => 'Modern Villa', 'category' => 'RESIDENTIAL', 'desc' => 'A private sanctuary of clean lines and expansive glass, redefining the boundaries between indoor and outdoor living.', 'image' => ''),
                    array('title' => 'City Center', 'category' => 'PROPERTY', 'desc' => 'A landmark development revitalizing the urban core with sustainable design and vibrant public spaces.', 'image' => ''),
                )
            ),
            'landscape' => array(
                'header_title' => 'Landscape Architecture',
                'subtitle' => 'Designing living ecosystems that harmonize human dwellings with nature.',
                'bg_image' => '',
                'items' => array(
                    array('title' => 'Silent Peaks', 'desc' => 'A serene exploration of mountain architecture.', 'location' => 'Switzerland', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Marcel E.', 'width' => 220, 'height' => 280, 'top' => '10%', 'left' => '5%', 'image' => ''),
                    array('title' => 'Urban Flow', 'desc' => 'Capturing the movement of city life.', 'location' => 'Tokyo, Japan', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Kenji T.', 'width' => 260, 'height' => 180, 'top' => '25%', 'left' => '45%', 'image' => ''),
                    array('title' => 'Desert Mirage', 'desc' => 'Heat and light playing tricks on the eye.', 'location' => 'Dubai, UAE', 'year' => '2023', 'type' => 'Landscape', 'photographer' => 'Sarah K.', 'width' => 200, 'height' => 200, 'top' => '60%', 'left' => '15%', 'image' => ''),
                    array('title' => 'Forest Edge', 'desc' => 'Where nature meets structure.', 'location' => 'Black Forest, Germany', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Hans M.', 'width' => 240, 'height' => 300, 'top' => '50%', 'left' => '70%', 'image' => ''),
                    array('title' => 'Ocean View', 'desc' => 'Infinite horizons and calming blues.', 'location' => 'Malibu, CA', 'year' => '2025', 'type' => 'Landscape', 'photographer' => 'David R.', 'width' => 180, 'height' => 220, 'top' => '15%', 'left' => '80%', 'image' => ''),
                    array('title' => 'Night Lights', 'desc' => 'The city comes alive after dark.', 'location' => 'Singapore', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Elena S.', 'width' => 200, 'height' => 160, 'top' => '75%', 'left' => '40%', 'image' => ''),
                )
            ),
            'interior' => array(
                'header_title' => 'Interior Architecture',
                'subtitle' => 'Curated spaces, material palettes, and bespoke light dynamics.',
                'bg_image' => '',
                'items' => array(
                    array('title' => 'Go-to-urban', 'subtitle' => 'Descubre la colección Evo', 'location' => 'Portola Valley, CA', 'image' => ''),
                    array('title' => 'Sublime', 'subtitle' => 'Elegance in every detail', 'location' => 'Howell Mountain, CA', 'image' => ''),
                    array('title' => 'Urban Echo', 'subtitle' => 'Modern living spaces', 'location' => 'Carmel-by-the-sea, CA', 'image' => ''),
                    array('title' => 'Nightfall', 'subtitle' => 'Shadows and light', 'location' => 'Silicon Valley, CA', 'image' => ''),
                )
            ),
            'collaboration' => array(
                'header_title' => 'Collaboration & Research',
                'subtitle' => 'Partnering with global visionaries, structural engineers, and artists.',
                'bg_image' => '',
                'items' => array(
                    array(
                        'title' => 'to the unknown',
                        'subtitle' => 'AND BACK',
                        'label' => 'BEYOND LIMITS',
                        'desc' => 'A collaborative journey into the depths of architectural surrealism, where boundaries between space and time dissolve into pure form.',
                        'image' => ''
                    ),
                    array(
                        'title' => 'in the clouds',
                        'subtitle' => 'GET LOST',
                        'label' => 'ETHEREAL FORMS',
                        'desc' => 'Dream the impossible dream with this artistic collaboration. We merge structural integrity with the ethereal nature of the sky.',
                        'image' => ''
                    ),
                    array(
                        'title' => 'silent echoes',
                        'subtitle' => 'LISTEN CLOSE',
                        'label' => 'MINIMAL RESONANCE',
                        'desc' => 'Exploring the resonance of minimalist structures in vast, silent landscapes. A study in acoustic and visual harmony.',
                        'image' => ''
                    ),
                    array(
                        'title' => 'liquid light',
                        'subtitle' => 'FLOW FREE',
                        'label' => 'DYNAMIC FLOW',
                        'desc' => 'Where architecture meets the fluid nature of light. A collaboration focused on dynamic transparency and reflection.',
                        'image' => ''
                    ),
                )
            ),
            'technology' => array(
                'header_title' => 'TECHNOLOGY',
                'subtitle' => 'Innovation',
                'bg_image' => '',
                'items' => array(
                    array('title' => 'Notes on Vision', 'subtitle' => '12 Images', 'desc' => 'Exploring the boundaries of visual perception through architectural lens. A study in light, shadow, and form.', 'year' => '2024', 'location' => 'Berlin', 'image' => ''),
                    array('title' => 'Undesignated', 'subtitle' => '09 Images', 'desc' => 'Spaces that defy traditional categorization. Fluid environments designed for adaptability and change.', 'year' => '2023', 'location' => 'Tokyo', 'image' => ''),
                    array('title' => 'Florence', 'subtitle' => '20 Images', 'desc' => 'A modern reinterpretation of classical Renaissance principles. Harmony, proportion, and beauty in the digital age.', 'year' => '2025', 'location' => 'Florence', 'image' => ''),
                    array('title' => 'Coherence', 'subtitle' => '15 Images', 'desc' => 'Finding unity in chaos. Structural integrity meets organic growth patterns.', 'year' => '2024', 'location' => 'New York', 'image' => ''),
                    array('title' => 'Urban Flux', 'subtitle' => '18 Images', 'desc' => 'Capturing the dynamic energy of metropolitan life. Architecture as a living, breathing entity.', 'year' => '2023', 'location' => 'London', 'image' => ''),
                )
            ),
            'contact' => array(
                'title' => "Let's Build\nTogether.",
                'subtitle' => 'Reach out to collaborate on your next architectural or art vision.',
                'bg_image' => '',
                'visit_title' => 'Visit Us',
                'map_image' => '',
                'google_maps_url' => 'https://maps.google.com',
                'social_instagram' => 'https://www.instagram.com/ajidhas_sand_associates/',
                'social_linkedin' => 'https://www.linkedin.com/company/ajidhas-sand-associates/'
            ),
            'footer' => array(
                'brand_title' => 'Ajidhas & Associates',
                'explore_title' => 'Explore',
                'contact_title' => 'Contact',
                'newsletter_title' => 'Newsletter',
                'newsletter_desc' => 'Subscribe to receive updates on new projects and exhibitions.',
                'copyright_text' => '© 2026 Ajidhas & Associates Studio. All rights reserved.',
                'privacy_url' => '#',
                'terms_url' => '#',
                'explore_links' => array(
                    array('label' => 'Architecture', 'url' => '/architecture'),
                    array('label' => 'Art Collection', 'url' => '/art'),
                    array('label' => 'Gallery', 'url' => '/art/gallery'),
                    array('label' => 'The Artist', 'url' => '/art/artist')
                )
            ),
            'project_preview' => array(
                'header_title' => 'Project Preview Studio',
                'projects' => array(
                    array('id' => 1, 'title' => 'Ethereal Silence', 'category' => 'Series 01', 'year' => '2025', 'image' => ''),
                    array('id' => 2, 'title' => 'Bronze Form No. 4', 'category' => 'Series 02', 'year' => '2024', 'image' => ''),
                    array('id' => 3, 'title' => 'Monolith', 'category' => 'Series 03', 'year' => '2025', 'image' => ''),
                    array('id' => 4, 'title' => 'Urban Echo', 'category' => 'Series 04', 'year' => '2024', 'image' => ''),
                    array('id' => 5, 'title' => 'Shadow Play', 'category' => 'Series 05', 'year' => '2025', 'image' => ''),
                    array('id' => 6, 'title' => 'Geometric Void', 'category' => 'Series 06', 'year' => '2025', 'image' => ''),
                )
            )
        );
    }

    /**
     * Get Merged Content (Option database values merged with default structure)
     */
    public function get_merged_content() {
        $stored = get_option($this->option_key, array());
        if (!is_array($stored)) {
            $stored = array();
        }
        $defaults = $this->get_default_content();

        foreach ($defaults as $section_key => $section_defaults) {
            if (!isset($stored[$section_key]) || !is_array($stored[$section_key])) {
                $stored[$section_key] = $section_defaults;
            } else {
                $stored[$section_key] = wp_parse_args($stored[$section_key], $section_defaults);
            }
        }
        return $stored;
    }

    /**
     * Seed Default Content for All Sections
     */
    private function seed_default_content() {
        if (!get_option($this->option_key)) {
            update_option($this->option_key, $this->get_default_content());
        }
    }

    /**
     * Register Custom Post Types for Projects
     */
    public function register_custom_post_types() {
        $labels = array(
            'name'                  => _x('Projects', 'Post Type General Name', 'ajidhas-crm'),
            'singular_name'         => _x('Project', 'Post Type Singular Name', 'ajidhas-crm'),
            'menu_name'             => __('Ajidhas Projects', 'ajidhas-crm'),
            'all_items'             => __('All Projects', 'ajidhas-crm'),
            'add_new_item'          => __('Add New Project', 'ajidhas-crm'),
            'edit_item'             => __('Edit Project', 'ajidhas-crm'),
        );
        $args = array(
            'label'                 => __('Project', 'ajidhas-crm'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields', 'excerpt'),
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => 'ajidhas-crm-dashboard',
            'show_in_rest'          => true,
            'has_archive'           => true,
            'rest_base'             => 'projects',
        );
        register_post_type('ajidhas_project', $args);
    }

    /**
     * Register WP Admin Menu & Pages
     */
    public function register_admin_menu() {
        add_menu_page(
            'Ajidhas CRM',
            'Ajidhas CRM',
            'manage_options',
            'ajidhas-crm-dashboard',
            array($this, 'render_admin_dashboard'),
            'dashicons-building',
            3
        );

        add_submenu_page(
            'ajidhas-crm-dashboard',
            'Section Text & Media Manager',
            'Section Text & Media',
            'manage_options',
            'ajidhas-crm-content',
            array($this, 'render_content_manager_page')
        );

        add_submenu_page(
            'ajidhas-crm-dashboard',
            'Leads & Inquiries CRM',
            'Leads CRM',
            'manage_options',
            'ajidhas-crm-leads',
            array($this, 'render_leads_crm_page')
        );
    }

    /**
     * Enqueue Admin Assets & WP Media Uploader
     */
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'ajidhas-crm') !== false) {
            wp_enqueue_media();
            wp_enqueue_style('ajidhas-admin-css', false);
            $css = "
                .ajidhas-wrap { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 1200px; margin: 20px 0; }
                .ajidhas-card { background: #fff; border: 1px solid #ccd0d4; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px; padding: 24px; margin-bottom: 24px; }
                .ajidhas-nav-tab-wrapper { border-bottom: 1px solid #ccc; margin-bottom: 20px; display: flex; gap: 6px; flex-wrap: wrap; }
                .ajidhas-tab-btn { padding: 9px 15px; background: #e2e8f0; border: none; border-radius: 6px 6px 0 0; cursor: pointer; font-weight: 600; font-size: 13px; color: #334155; }
                .ajidhas-tab-btn.active { background: #0f172a; color: #fff; }
                .ajidhas-tab-content { display: none; }
                .ajidhas-tab-content.active { display: block; }
                .form-row { margin-bottom: 20px; }
                .form-row label { display: block; font-weight: 600; margin-bottom: 6px; color: #1e293b; }
                .form-row input[type='text'], .form-row textarea, .form-row select { width: 100%; max-width: 650px; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
                .img-preview { max-width: 200px; max-height: 120px; margin-top: 10px; border-radius: 6px; border: 1px solid #cbd5e1; display: block; background: #f8fafc; object-fit: cover; }
                .upload-btn { background: #2563eb; color: #fff; border: none; padding: 7px 14px; border-radius: 5px; cursor: pointer; margin-top: 6px; display: inline-block; font-size: 13px; font-weight: 600; }
                .upload-btn:hover { background: #1d4ed8; }
                .clear-btn { background: #ef4444; color: #fff; border: none; padding: 7px 14px; border-radius: 5px; cursor: pointer; margin-top: 6px; margin-left: 6px; font-size: 13px; font-weight: 600; }
                .crm-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                .crm-table th, .crm-table td { padding: 12px 15px; border: 1px solid #e2e8f0; text-align: left; }
                .crm-table th { background: #f8fafc; font-weight: 700; color: #1e293b; }
                .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
                .status-new { background: #dbeafe; color: #1e40af; }
                .status-contacted { background: #fef3c7; color: #92400e; }
                .status-in_progress { background: #e0e7ff; color: #3730a3; }
                .status-closed { background: #dcfce7; color: #166534; }
                .btn-save { background: #0f172a; color: #fff; font-weight: 700; padding: 12px 28px; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; }
                .btn-save:hover { background: #334155; }
            ";
            wp_add_inline_style('wp-admin', $css);
        }
    }

    /**
     * Render Admin Dashboard
     */
    public function render_admin_dashboard() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $total_leads = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        $new_leads = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'new'");
        $total_projects = wp_count_posts('ajidhas_project')->publish;

        echo '<div class="wrap ajidhas-wrap">';
        echo '<h1> Ajidhas & Associates — Section Content & Lead CRM</h1>';
        echo '<p style="font-size: 15px; color: #475569;">Manage all section text, page images, hero backgrounds, and lead inquiries without affecting your frontend UI layout.</p>';

        echo '<div style="display: flex; gap: 20px; margin-top: 25px;">';

        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #3b82f6;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">📥 Total Inquiries</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #3b82f6;">' . esc_html($total_leads) . '</div>';
        echo '<p><a href="' . admin_url('admin.php?page=ajidhas-crm-leads') . '" class="button button-primary">View Leads CRM</a></p>';
        echo '</div>';

        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #10b981;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">⭐ New Unread Leads</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #10b981;">' . esc_html($new_leads) . '</div>';
        echo '<p><a href="' . admin_url('admin.php?page=ajidhas-crm-leads') . '" class="button">Manage New Leads</a></p>';
        echo '</div>';

        echo '<div class="ajidhas-card" style="flex: 1; border-top: 4px solid #8b5cf6;">';
        echo '<h3 style="margin-top: 0; color: #1e293b;">🖼️ Published Projects</h3>';
        echo '<div style="font-size: 36px; font-weight: 700; color: #8b5cf6;">' . esc_html($total_projects) . '</div>';
        echo '<p><a href="' . admin_url('edit.php?post_type=ajidhas_project') . '" class="button">Manage Projects</a></p>';
        echo '</div>';

        echo '</div>';

        echo '<div class="ajidhas-card" style="margin-top: 10px;">';
        echo '<h3> Headless REST API Integration Status</h3>';
        echo '<ul>';
        echo '<li><strong>Section Content API:</strong> <code>' . esc_url(rest_url('ajidhas/v1/content')) . '</code></li>';
        echo '<li><strong>Projects API:</strong> <code>' . esc_url(rest_url('ajidhas/v1/projects')) . '</code></li>';
        echo '<li><strong>Inquiries Endpoint:</strong> <code>' . esc_url(rest_url('ajidhas/v1/inquiry')) . '</code></li>';
        echo '</ul>';
        echo '</div>';

        echo '</div>';
    }

    /**
     * Render Content Manager Page with Tabs for ALL Sections
     */
    public function render_content_manager_page() {
        if (!current_user_can('manage_options')) return;

        if (isset($_POST['ajidhas_save_content']) && check_admin_referer('ajidhas_content_nonce')) {
            $posted_data = isset($_POST['ajidhas_content']) ? $_POST['ajidhas_content'] : array();
            update_option($this->option_key, $posted_data);
            echo '<div class="updated"><p><strong>Success!</strong> All section text, images, and background images saved.</p></div>';
        }

        $content = $this->get_merged_content();

        ?>
        <div class="wrap ajidhas-wrap">
            <h1> All Sections — Text, Image & Background Image Manager</h1>
            <p>Select images from your WordPress Media Library or enter image URLs to update your React website dynamically without breaking UI layout.</p>

            <form method="post" action="">
                <?php wp_nonce_field('ajidhas_content_nonce'); ?>

                <div class="ajidhas-nav-tab-wrapper">
                    <button type="button" class="ajidhas-tab-btn active" onclick="openTab(event, 'tab-general')">🌐 General & Branding</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-home')">🏠 Home</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-architecture')">🏛️ Architecture</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-arch-all')">📐 All Work Tunnel</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-art')">🎨 Art Studio</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-gallery')">🖼️ Gallery Series</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-about')">👥 About Studio</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-vis')">🖼️ Visualisation</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-tech')">⚡ Technology</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-landscape')">🌿 Landscape</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-interior')">🛋️ Interior</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-collab')">🤝 Collaboration</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-contact')">📞 Contact</button>
                    <button type="button" class="ajidhas-tab-btn" onclick="openTab(event, 'tab-footer')">🦶 Footer</button>
                </div>

                <!-- Tab General -->
                <div id="tab-general" class="ajidhas-tab-content active ajidhas-card">
                    <h2>General & Studio Branding</h2>
                    <div class="form-row">
                        <label>Site Main Title</label>
                        <input type="text" name="ajidhas_content[general][site_title]" value="<?php echo esc_attr($content['general']['site_title'] ?? 'Ajidhas and Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Studio Tagline / Subtitle</label>
                        <input type="text" name="ajidhas_content[general][site_subtitle]" value="<?php echo esc_attr($content['general']['site_subtitle'] ?? 'Architecture & Art Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Main Logo Image</label>
                        <input type="text" id="logo_url" name="ajidhas_content[general][logo_url]" value="<?php echo esc_url($content['general']['logo_url'] ?? ''); ?>" placeholder="Leave blank to use local logo asset" />
                        <button type="button" class="upload-btn" onclick="selectMedia('logo_url', 'logo_preview')">Upload / Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('logo_url', 'logo_preview')">Clear</button>
                        <img id="logo_preview" class="img-preview" src="<?php echo esc_url($content['general']['logo_url'] ?? ''); ?>" style="<?php echo empty($content['general']['logo_url']) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Email</label>
                        <input type="text" name="ajidhas_content[general][contact_email]" value="<?php echo esc_attr($content['general']['contact_email'] ?? 'ajidhassandassociates@gmail.com'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Phone</label>
                        <input type="text" name="ajidhas_content[general][contact_phone]" value="<?php echo esc_attr($content['general']['contact_phone'] ?? '+91 9790847621'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Office Address</label>
                        <textarea name="ajidhas_content[general][contact_address]" rows="3"><?php echo esc_textarea($content['general']['contact_address'] ?? "Chennai, India\nAvailable Worldwide"); ?></textarea>
                    </div>
                </div>

                <!-- Tab Home -->
                <div id="tab-home" class="ajidhas-tab-content ajidhas-card">
                    <h2>Home Section Settings</h2>
                    <div class="form-row">
                        <label>Hero Headline</label>
                        <input type="text" name="ajidhas_content[home][hero_title]" value="<?php echo esc_attr($content['home']['hero_title'] ?? 'Ajidhas and Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Hero Subtitle</label>
                        <input type="text" name="ajidhas_content[home][hero_subtitle]" value="<?php echo esc_attr($content['home']['hero_subtitle'] ?? 'Architecture & Art Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Home Background Image</label>
                        <input type="text" id="home_bg" name="ajidhas_content[home][bg_image]" value="<?php echo esc_url($content['home']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('home_bg', 'home_bg_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('home_bg', 'home_bg_preview')">Clear</button>
                        <img id="home_bg_preview" class="img-preview" src="<?php echo esc_url($content['home']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['home']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Architecture -->
                <div id="tab-architecture" class="ajidhas-tab-content ajidhas-card">
                    <h2>Architecture Section Settings</h2>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[architecture][header_title]" value="<?php echo esc_attr($content['architecture']['header_title'] ?? 'Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 1 (Night View)</label>
                        <input type="text" id="arch_bg_0" name="ajidhas_content[architecture][bg_images][0]" value="<?php echo esc_url($content['architecture']['bg_images'][0] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_0', 'arch_bg_0_preview')">Choose Image</button>
                        <img id="arch_bg_0_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][0] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][0]) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 2 (Structure)</label>
                        <input type="text" id="arch_bg_1" name="ajidhas_content[architecture][bg_images][1]" value="<?php echo esc_url($content['architecture']['bg_images'][1] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_1', 'arch_bg_1_preview')">Choose Image</button>
                        <img id="arch_bg_1_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][1] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][1]) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Background Image 3 (Interior / Facade)</label>
                        <input type="text" id="arch_bg_2" name="ajidhas_content[architecture][bg_images][2]" value="<?php echo esc_url($content['architecture']['bg_images'][2] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_bg_2', 'arch_bg_2_preview')">Choose Image</button>
                        <img id="arch_bg_2_preview" class="img-preview" src="<?php echo esc_url($content['architecture']['bg_images'][2] ?? ''); ?>" style="<?php echo empty($content['architecture']['bg_images'][2]) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🏛️ Editorial Architecture Projects (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addEditorialProject()" style="background: #10b981;">+ Add New Editorial Project</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage editorial showcase projects displayed on the Architecture Projects page. Create, Edit, or Delete projects dynamically.</p>

                    <div id="editorial-projects-container">
                        <?php
                        $default_editorial_projects = array(
                            array('title' => 'casa serena', 'location' => 'BARCELONA', 'year' => '2025', 'coords' => '41.3851° N, 2.1734° E', 'description' => 'a minimalist sanctuary where light dances through geometric volumes. clean lines meet warm materials in perfect harmony', 'designer' => 'ANTONI MARTÍNEZ', 'image' => ''),
                            array('title' => 'skyline residence', 'location' => 'DUBAI', 'year' => '2025', 'coords' => '25.2048° N, 55.2708° E', 'description' => 'vertical living redefined. floor-to-ceiling glass frames the city below, while sustainable design meets luxury', 'designer' => 'FATIMA AL-RASHID', 'image' => ''),
                            array('title' => 'forest pavilion', 'location' => 'KYOTO', 'year' => '2024', 'coords' => '35.0116° N, 135.7681° E', 'description' => 'traditional japanese aesthetics reimagined. natural wood, stone gardens, and the gentle sound of water', 'designer' => 'KENJI TANAKA', 'image' => ''),
                        );
                        $editorial_projects = !empty($content['architecture']['projects']) && is_array($content['architecture']['projects']) ? $content['architecture']['projects'] : $default_editorial_projects;
                        foreach ($editorial_projects as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_location = $item['location'] ?? 'BARCELONA';
                            $item_year = $item['year'] ?? '2025';
                            $item_coords = $item['coords'] ?? '41.3851° N, 2.1734° E';
                            $item_desc = $item['description'] ?? '';
                            $item_designer = $item['designer'] ?? 'ANTONI MARTÍNEZ';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="editorial-project-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Editorial Project #<span class="editorial-project-index"><?php echo ($index + 1); ?></span>: <span class="editorial-project-title-preview"><?php echo esc_html($item_title ?: 'Untitled Project'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeEditorialProject(this)">🗑️ Delete Project</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Project Title</label>
                                        <input type="text" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.editorial-project-card').querySelector('.editorial-project-title-preview').innerText = this.value || 'Untitled Project'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Designer Name</label>
                                        <input type="text" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][designer]" value="<?php echo esc_attr($item_designer); ?>" placeholder="e.g. ANTONI MARTÍNEZ" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Location & Year</label>
                                        <div style="display: flex; gap: 8px;">
                                            <input type="text" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][location]" value="<?php echo esc_attr($item_location); ?>" placeholder="Location" style="width: 60%;" />
                                            <input type="text" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][year]" value="<?php echo esc_attr($item_year); ?>" placeholder="Year" style="width: 40%;" />
                                        </div>
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>GPS Coordinates</label>
                                        <input type="text" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][coords]" value="<?php echo esc_attr($item_coords); ?>" placeholder="e.g. 41.3851° N, 2.1734° E" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Editorial Description</label>
                                    <textarea name="ajidhas_content[architecture][projects][<?php echo $index; ?>][description]" rows="2" placeholder="Brief project description"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Project Hero Image</label>
                                    <input type="text" id="editorial_proj_img_<?php echo $index; ?>" name="ajidhas_content[architecture][projects][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local background image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('editorial_proj_img_<?php echo $index; ?>', 'editorial_proj_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('editorial_proj_img_<?php echo $index; ?>', 'editorial_proj_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="editorial_proj_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Architecture All Work Tunnel -->
                <div id="tab-arch-all" class="ajidhas-tab-content ajidhas-card">
                    <h2>Architecture All Work 3D Tunnel Settings</h2>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[architecture_all][header_title]" value="<?php echo esc_attr($content['architecture_all']['header_title'] ?? 'ALL WORK'); ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">📐 3D Tunnel Architecture Projects (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addArchProject()" style="background: #10b981;">+ Add New Architecture Project</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage projects displayed in the interactive 3D Tunnel and Full-Screen Detail Modal. Create, Edit, or Delete projects dynamically.</p>

                    <div id="arch-projects-container">
                        <?php
                        $default_arch_projects = array(
                            array('title' => 'The Nexus Tower', 'desc' => 'A vertical city within a city, redefining urban living with sustainable innovation.', 'location' => 'Europe', 'year' => '2024', 'status' => 'Completed', 'type' => 'Commercial', 'image' => ''),
                            array('title' => 'Horizon House', 'desc' => 'Where earth meets sky. A cantilevered masterpiece suspended over the valley.', 'location' => 'Asia', 'year' => '2024', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                            array('title' => 'Aqua Residence', 'desc' => 'Fluid architecture inspired by water. Curves and reflections create a living sculpture.', 'location' => 'Americas', 'year' => '2025', 'status' => 'In Design', 'type' => 'Residential', 'image' => ''),
                            array('title' => 'The Void Gallery', 'desc' => 'Negative space becomes the artwork. A museum that celebrates emptiness.', 'location' => 'Europe', 'year' => '2023', 'status' => 'Completed', 'type' => 'Cultural', 'image' => ''),
                            array('title' => 'Copper Sanctuary', 'desc' => 'Oxidized metal meets sacred geometry in this meditation retreat.', 'location' => 'Asia', 'year' => '2024', 'status' => 'Completed', 'type' => 'Hospitality', 'image' => ''),
                            array('title' => 'Crystal Pavilion', 'desc' => 'Transparent walls dissolve boundaries between nature and architecture.', 'location' => 'Europe', 'year' => '2025', 'status' => 'Under Construction', 'type' => 'Public', 'image' => ''),
                            array('title' => 'Midnight Studios', 'desc' => 'Creative spaces bathed in controlled darkness and dramatic light.', 'location' => 'Americas', 'year' => '2024', 'status' => 'Completed', 'type' => 'Studio', 'image' => ''),
                            array('title' => 'Bamboo Residence', 'desc' => 'Sustainable living through traditional materials and modern design.', 'location' => 'Asia', 'year' => '2023', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                            array('title' => 'Cliffside Villa', 'desc' => 'Perched on the edge of possibility, embracing the dramatic landscape.', 'location' => 'Europe', 'year' => '2025', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                            array('title' => 'Concrete Poetry', 'desc' => 'Brutalist forms softened by natural light and green terraces.', 'location' => 'Europe', 'year' => '2024', 'status' => 'Completed', 'type' => 'Mixed Use', 'image' => ''),
                            array('title' => 'White Cube Loft', 'desc' => 'Pure minimalism. Every element serves a purpose, nothing more.', 'location' => 'Americas', 'year' => '2023', 'status' => 'Completed', 'type' => 'Residential', 'image' => ''),
                            array('title' => 'Garden Bridge House', 'desc' => 'A living connection between two hillsides, wrapped in vegetation.', 'location' => 'Asia', 'year' => '2025', 'status' => 'In Design', 'type' => 'Residential', 'image' => ''),
                        );
                        $arch_projects = !empty($content['architecture_all']['projects']) && is_array($content['architecture_all']['projects']) ? $content['architecture_all']['projects'] : $default_arch_projects;
                        foreach ($arch_projects as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_desc = $item['desc'] ?? '';
                            $item_location = $item['location'] ?? 'Worldwide';
                            $item_year = $item['year'] ?? '2025';
                            $item_status = $item['status'] ?? 'Completed';
                            $item_type = $item['type'] ?? 'Residential';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="arch-project-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Project #<span class="arch-project-index"><?php echo ($index + 1); ?></span>: <span class="arch-project-title-preview"><?php echo esc_html($item_title ?: 'Untitled Project'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeArchProject(this)">🗑️ Delete Project</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Project Title</label>
                                        <input type="text" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.arch-project-card').querySelector('.arch-project-title-preview').innerText = this.value || 'Untitled Project'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Project Type</label>
                                        <input type="text" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][type]" value="<?php echo esc_attr($item_type); ?>" placeholder="e.g. Residential, Commercial" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Location</label>
                                        <input type="text" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][location]" value="<?php echo esc_attr($item_location); ?>" placeholder="e.g. Europe" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Year / Status</label>
                                        <div style="display: flex; gap: 8px;">
                                            <input type="text" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][year]" value="<?php echo esc_attr($item_year); ?>" placeholder="Year" style="width: 40%;" />
                                            <input type="text" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][status]" value="<?php echo esc_attr($item_status); ?>" placeholder="Status (e.g. Completed)" style="width: 60%;" />
                                        </div>
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Description / Story</label>
                                    <textarea name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][desc]" rows="2" placeholder="Brief project description"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Project Image</label>
                                    <input type="text" id="arch_proj_img_<?php echo $index; ?>" name="ajidhas_content[architecture_all][projects][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local background image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('arch_proj_img_<?php echo $index; ?>', 'arch_proj_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('arch_proj_img_<?php echo $index; ?>', 'arch_proj_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="arch_proj_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Art -->
                <div id="tab-art" class="ajidhas-tab-content ajidhas-card">
                    <h2>Art Studio Section Settings</h2>
                    <div class="form-row">
                        <label>Header Label (Badge)</label>
                        <input type="text" name="ajidhas_content[art][header_label]" value="<?php echo esc_attr($content['art']['header_label'] ?? 'Art Collection'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Header Title</label>
                        <input type="text" name="ajidhas_content[art][header_title]" value="<?php echo esc_attr($content['art']['header_title'] ?? 'Ajidhas & Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Header Subtitle</label>
                        <input type="text" name="ajidhas_content[art][header_subtitle]" value="<?php echo esc_attr($content['art']['header_subtitle'] ?? 'Curated works from visionary artists'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Subtitle / Overview</label>
                        <input type="text" name="ajidhas_content[art][subtitle]" value="<?php echo esc_attr($content['art']['subtitle'] ?? 'Exploring the Boundaries of Space, Light & Form'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Art Section Background Image</label>
                        <input type="text" id="art_bg" name="ajidhas_content[art][bg_image]" value="<?php echo esc_url($content['art']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('art_bg', 'art_bg_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('art_bg', 'art_bg_preview')">Clear</button>
                        <img id="art_bg_preview" class="img-preview" src="<?php echo esc_url($content['art']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['art']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🎨 Featured Artworks Collection (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addArtItem()" style="background: #10b981;">+ Add New Artwork</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage featured artworks displayed on the Art Landing section. Create, Edit, or Delete pieces dynamically without affecting UI layout.</p>

                    <div id="art-items-container">
                        <?php
                        $default_art_items = array(
                            array('title' => 'Ethereal Silence', 'artist' => 'Ajidhas', 'year' => '2025', 'medium' => 'Mixed Media on Canvas', 'image' => ''),
                            array('title' => 'Bronze Form No. 4', 'artist' => 'Ajidhas', 'year' => '2024', 'medium' => 'Bronze Sculpture', 'image' => ''),
                            array('title' => 'Monolith', 'artist' => 'Ajidhas', 'year' => '2025', 'medium' => 'Photography', 'image' => ''),
                        );
                        $art_items = !empty($content['art']['items']) && is_array($content['art']['items']) ? $content['art']['items'] : $default_art_items;
                        foreach ($art_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_artist = $item['artist'] ?? 'Ajidhas';
                            $item_year = $item['year'] ?? date('Y');
                            $item_medium = $item['medium'] ?? '';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="art-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Artwork #<span class="art-item-index"><?php echo ($index + 1); ?></span>: <span class="art-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Piece'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeArtItem(this)">🗑️ Delete Artwork</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Title</label>
                                        <input type="text" name="ajidhas_content[art][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.art-item-card').querySelector('.art-item-title-preview').innerText = this.value || 'Untitled Piece'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Artist</label>
                                        <input type="text" name="ajidhas_content[art][items][<?php echo $index; ?>][artist]" value="<?php echo esc_attr($item_artist); ?>" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Year</label>
                                        <input type="text" name="ajidhas_content[art][items][<?php echo $index; ?>][year]" value="<?php echo esc_attr($item_year); ?>" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Medium</label>
                                        <input type="text" name="ajidhas_content[art][items][<?php echo $index; ?>][medium]" value="<?php echo esc_attr($item_medium); ?>" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Artwork Image</label>
                                    <input type="text" id="art_item_img_<?php echo $index; ?>" name="ajidhas_content[art][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local artwork image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('art_item_img_<?php echo $index; ?>', 'art_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('art_item_img_<?php echo $index; ?>', 'art_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="art_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <h3> Principal Artist Profile</h3>
                    <div class="form-row">
                        <label>Artist Name</label>
                        <input type="text" name="ajidhas_content[art][artist_name]" value="<?php echo esc_attr($content['art']['artist_name'] ?? 'Ajidhas'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Artist Role</label>
                        <input type="text" name="ajidhas_content[art][artist_role]" value="<?php echo esc_attr($content['art']['artist_role'] ?? 'Principal Artist & Architect'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Artist Biography</label>
                        <textarea name="ajidhas_content[art][artist_bio]" rows="3"><?php echo esc_textarea($content['art']['artist_bio'] ?? 'Blending architectural precision with abstract expressionism.'); ?></textarea>
                    </div>
                    <div class="form-row">
                        <label>Artist Profile Photo</label>
                        <input type="text" id="artist_img" name="ajidhas_content[art][artist_image]" value="<?php echo esc_url($content['art']['artist_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('artist_img', 'artist_img_preview')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('artist_img', 'artist_img_preview')">Clear</button>
                        <img id="artist_img_preview" class="img-preview" src="<?php echo esc_url($content['art']['artist_image'] ?? ''); ?>" style="<?php echo empty($content['art']['artist_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                </div>

                <!-- Tab Gallery Series -->
                <div id="tab-gallery" class="ajidhas-tab-content ajidhas-card">
                    <h2>Gallery Series Settings</h2>
                    <div class="form-row">
                        <label>Header Label</label>
                        <input type="text" name="ajidhas_content[gallery][header_label]" value="<?php echo esc_attr($content['gallery']['header_label'] ?? 'Gallery'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[gallery][header_title]" value="<?php echo esc_attr($content['gallery']['header_title'] ?? 'Artistic Series'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Footer Hint Text</label>
                        <input type="text" name="ajidhas_content[gallery][footer_hint]" value="<?php echo esc_attr($content['gallery']['footer_hint'] ?? 'Scroll to explore'); ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🖼️ Gallery Series Collection (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addGalleryItem()" style="background: #10b981;">+ Add New Series Item</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage artistic series items displayed in the 3D Gallery viewport. Create, Edit, or Delete series items dynamically without affecting UI layout.</p>

                    <div id="gallery-items-container">
                        <?php
                        $default_gallery_items = array(
                            array('title' => 'Hatha Yoga', 'label' => 'Series 01', 'image' => ''),
                            array('title' => 'Vinyasa Yoga', 'label' => 'Series 02', 'image' => ''),
                            array('title' => 'Ashtanga Yoga', 'label' => 'Series 03', 'image' => ''),
                            array('title' => 'Yin Yoga', 'label' => 'Series 04', 'image' => ''),
                            array('title' => 'Kundalini Yoga', 'label' => 'Series 05', 'image' => ''),
                            array('title' => 'Restorative Yoga', 'label' => 'Series 06', 'image' => ''),
                        );
                        $gallery_items = !empty($content['gallery']['items']) && is_array($content['gallery']['items']) ? $content['gallery']['items'] : $default_gallery_items;
                        foreach ($gallery_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_label = $item['label'] ?? ('Series ' . str_pad($index + 1, 2, '0', STR_PAD_LEFT));
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="gallery-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Series Item #<span class="gallery-item-index"><?php echo ($index + 1); ?></span>: <span class="gallery-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Series'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeGalleryItem(this)">🗑️ Delete Series Item</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Title</label>
                                        <input type="text" name="ajidhas_content[gallery][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.gallery-item-card').querySelector('.gallery-item-title-preview').innerText = this.value || 'Untitled Series'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Label / Series Badge</label>
                                        <input type="text" name="ajidhas_content[gallery][items][<?php echo $index; ?>][label]" value="<?php echo esc_attr($item_label); ?>" placeholder="e.g. Series 01" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Series Image</label>
                                    <input type="text" id="gallery_item_img_<?php echo $index; ?>" name="ajidhas_content[gallery][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local artwork image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('gallery_item_img_<?php echo $index; ?>', 'gallery_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('gallery_item_img_<?php echo $index; ?>', 'gallery_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="gallery_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab About -->
                <div id="tab-about" class="ajidhas-tab-content ajidhas-card">
                    <h2>About Studio & Team Members</h2>
                    <div class="form-row">
                        <label>Header Title</label>
                        <input type="text" name="ajidhas_content[about][header_title]" value="<?php echo esc_attr($content['about']['header_title'] ?? 'About Our Studio'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Studio Overview Paragraph</label>
                        <textarea name="ajidhas_content[about][studio_description]" rows="3"><?php echo esc_textarea($content['about']['studio_description'] ?? 'A collective of visionary architects, designers, and artists crafting timeless environments.'); ?></textarea>
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">👥 Team Members (3D Interactive Carousel CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addTeamItem()" style="background: #10b981;">+ Add New Team Member</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage studio team members, roles, bio descriptions, and photos displayed on the 3D circular carousel on the About page.</p>

                    <div id="team-items-container">
                        <?php
                        $default_team = array(
                            array('name' => 'Ajidhas', 'role' => 'Principal Architect', 'image' => '', 'bio' => 'A visionary leader with over 15 years of experience in sustainable urban design. Ajidhas leads the studio with a commitment to harmonizing modern architecture with the natural environment.'),
                            array('name' => 'Pradeep', 'role' => 'Creative Director', 'image' => '', 'bio' => 'Pradeep brings a unique artistic perspective to every project. His expertise in spatial storytelling and material innovation ensures that each design is a visually poetic experience.'),
                            array('name' => 'Sarah Chen', 'role' => 'Lead Designer', 'image' => '', 'bio' => 'Sarah specializes in minimalist residential architecture. Her work is characterized by clean lines, functional elegance, and a deep understanding of natural light.'),
                            array('name' => 'Marcus Vane', 'role' => 'Technical Lead', 'image' => '', 'bio' => 'Marcus bridges the gap between complex engineering and architectural beauty. He ensures our most ambitious designs are structurally sound.')
                        );
                        $team = !empty($content['about']['team']) && is_array($content['about']['team']) ? $content['about']['team'] : $default_team;
                        foreach ($team as $index => $member) :
                            $t_name = $member['name'] ?? '';
                            $t_role = $member['role'] ?? '';
                            $t_img = $member['image'] ?? '';
                            $t_bio = $member['bio'] ?? '';
                        ?>
                            <div class="team-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Member #<span class="team-item-index"><?php echo ($index + 1); ?></span>: <span class="team-item-name-preview"><?php echo esc_html($t_name ?: 'Untitled Member'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeTeamItem(this)">🗑️ Delete Member</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Full Name</label>
                                        <input type="text" name="ajidhas_content[about][team][<?php echo $index; ?>][name]" value="<?php echo esc_attr($t_name); ?>" oninput="this.closest('.team-item-card').querySelector('.team-item-name-preview').innerText = this.value || 'Untitled Member'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Role / Position</label>
                                        <input type="text" name="ajidhas_content[about][team][<?php echo $index; ?>][role]" value="<?php echo esc_attr($t_role); ?>" placeholder="e.g. Principal Architect" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Biography</label>
                                    <textarea name="ajidhas_content[about][team][<?php echo $index; ?>][bio]" rows="2" placeholder="Brief member biography"><?php echo esc_textarea($t_bio); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Photo</label>
                                    <input type="text" id="team_img_<?php echo $index; ?>" name="ajidhas_content[about][team][<?php echo $index; ?>][image]" value="<?php echo esc_url($t_img); ?>" placeholder="Leave empty to use default local team photo" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('team_img_<?php echo $index; ?>', 'team_img_preview_<?php echo $index; ?>')">Choose Photo</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('team_img_<?php echo $index; ?>', 'team_img_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="team_img_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($t_img); ?>" style="<?php echo empty($t_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Visualisation -->
                <div id="tab-vis" class="ajidhas-tab-content ajidhas-card">
                    <h2>Visualisation Section Settings</h2>
                    <div class="form-row">
                        <label>Visualisation Section Title</label>
                        <input type="text" name="ajidhas_content[visualisation][header_title]" value="<?php echo esc_attr($content['visualisation']['header_title'] ?? 'Visualisation & 3D Renders'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Visualisation Background Image</label>
                        <input type="text" id="vis_bg" name="ajidhas_content[visualisation][bg_image]" value="<?php echo esc_url($content['visualisation']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('vis_bg', 'vis_bg_preview')">Choose Image</button>
                        <img id="vis_bg_preview" class="img-preview" src="<?php echo esc_url($content['visualisation']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['visualisation']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🎨 3D Render & Visualisation Showcase Items (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addVisItem()" style="background: #10b981;">+ Add New Render Item</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage full-screen 3D architectural renders, categories, descriptions, and high-resolution visuals for the Visualisation section.</p>

                    <div id="vis-items-container">
                        <?php
                        $default_vis_items = array(
                            array('title' => 'Haus am See', 'category' => 'RESIDENTIAL', 'desc' => 'A minimalist retreat nestled by the serene waters, blending modern geometry with natural tranquility.', 'image' => ''),
                            array('title' => 'Urban Loft', 'category' => 'PROPERTY', 'desc' => 'Sophisticated industrial living in the heart of the city, featuring open spaces and raw material palettes.', 'image' => ''),
                            array('title' => 'Alpine Retreat', 'category' => 'HOSPITALITY', 'desc' => 'Luxury mountain lodging designed to withstand the elements while providing unparalleled warmth and comfort.', 'image' => ''),
                            array('title' => 'Tech Hub', 'category' => 'CORPORATE', 'desc' => 'A futuristic workspace fostering innovation through dynamic architecture and integrated technology.', 'image' => ''),
                            array('title' => 'Modern Villa', 'category' => 'RESIDENTIAL', 'desc' => 'A private sanctuary of clean lines and expansive glass, redefining the boundaries between indoor and outdoor living.', 'image' => ''),
                            array('title' => 'City Center', 'category' => 'PROPERTY', 'desc' => 'A landmark development revitalizing the urban core with sustainable design and vibrant public spaces.', 'image' => ''),
                        );
                        $vis_items = !empty($content['visualisation']['items']) && is_array($content['visualisation']['items']) ? $content['visualisation']['items'] : $default_vis_items;
                        foreach ($vis_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_cat = $item['category'] ?? 'RESIDENTIAL';
                            $item_desc = $item['desc'] ?? ($item['description'] ?? '');
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="vis-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Render Item #<span class="vis-item-index"><?php echo ($index + 1); ?></span>: <span class="vis-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Render'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeVisItem(this)">🗑️ Delete Render Item</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Render Title</label>
                                        <input type="text" name="ajidhas_content[visualisation][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.vis-item-card').querySelector('.vis-item-title-preview').innerText = this.value || 'Untitled Render'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Category (e.g. RESIDENTIAL, CORPORATE)</label>
                                        <input type="text" name="ajidhas_content[visualisation][items][<?php echo $index; ?>][category]" value="<?php echo esc_attr($item_cat); ?>" placeholder="e.g. RESIDENTIAL" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Description</label>
                                    <textarea name="ajidhas_content[visualisation][items][<?php echo $index; ?>][desc]" rows="2" placeholder="Brief render description"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Render Image</label>
                                    <input type="text" id="vis_item_img_<?php echo $index; ?>" name="ajidhas_content[visualisation][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local render artwork" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('vis_item_img_<?php echo $index; ?>', 'vis_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('vis_item_img_<?php echo $index; ?>', 'vis_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="vis_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Technology -->
                <div id="tab-tech" class="ajidhas-tab-content ajidhas-card">
                    <h2>Technology Section Settings</h2>
                    <div class="form-row">
                        <label>Technology Section Title</label>
                        <input type="text" name="ajidhas_content[technology][header_title]" value="<?php echo esc_attr($content['technology']['header_title'] ?? 'TECHNOLOGY'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Entrance Overlay Tagline</label>
                        <input type="text" name="ajidhas_content[technology][subtitle]" value="<?php echo esc_attr($content['technology']['subtitle'] ?? 'Innovation'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Technology Background Image</label>
                        <input type="text" id="tech_bg" name="ajidhas_content[technology][bg_image]" value="<?php echo esc_url($content['technology']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('tech_bg', 'tech_bg_preview')">Choose Image</button>
                        <img id="tech_bg_preview" class="img-preview" src="<?php echo esc_url($content['technology']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['technology']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">💻 Technology & Innovation Marquee Items (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addTechItem()" style="background: #10b981;">+ Add New Tech Item</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage interactive marquee items, cover artwork, locations, years, and descriptions on the Technology page. Create, Edit, or Delete items dynamically.</p>

                    <div id="tech-items-container">
                        <?php
                        $default_tech_items = array(
                            array('title' => 'Notes on Vision', 'subtitle' => '12 Images', 'desc' => 'Exploring the boundaries of visual perception through architectural lens. A study in light, shadow, and form.', 'year' => '2024', 'location' => 'Berlin', 'image' => ''),
                            array('title' => 'Undesignated', 'subtitle' => '09 Images', 'desc' => 'Spaces that defy traditional categorization. Fluid environments designed for adaptability and change.', 'year' => '2023', 'location' => 'Tokyo', 'image' => ''),
                            array('title' => 'Florence', 'subtitle' => '20 Images', 'desc' => 'A modern reinterpretation of classical Renaissance principles. Harmony, proportion, and beauty in the digital age.', 'year' => '2025', 'location' => 'Florence', 'image' => ''),
                            array('title' => 'Coherence', 'subtitle' => '15 Images', 'desc' => 'Finding unity in chaos. Structural integrity meets organic growth patterns.', 'year' => '2024', 'location' => 'New York', 'image' => ''),
                            array('title' => 'Urban Flux', 'subtitle' => '18 Images', 'desc' => 'Capturing the dynamic energy of metropolitan life. Architecture as a living, breathing entity.', 'year' => '2023', 'location' => 'London', 'image' => ''),
                        );
                        $tech_items = !empty($content['technology']['items']) && is_array($content['technology']['items']) ? $content['technology']['items'] : $default_tech_items;
                        foreach ($tech_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_subtitle = $item['subtitle'] ?? '';
                            $item_desc = $item['desc'] ?? '';
                            $item_year = $item['year'] ?? '2024';
                            $item_location = $item['location'] ?? 'Berlin';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="tech-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Tech Item #<span class="tech-item-index"><?php echo ($index + 1); ?></span>: <span class="tech-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Item'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeTechItem(this)">🗑️ Delete Item</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Title</label>
                                        <input type="text" name="ajidhas_content[technology][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.tech-item-card').querySelector('.tech-item-title-preview').innerText = this.value || 'Untitled Item'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Subtitle / Count</label>
                                        <input type="text" name="ajidhas_content[technology][items][<?php echo $index; ?>][subtitle]" value="<?php echo esc_attr($item_subtitle); ?>" placeholder="e.g. 12 Images" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Year</label>
                                        <input type="text" name="ajidhas_content[technology][items][<?php echo $index; ?>][year]" value="<?php echo esc_attr($item_year); ?>" placeholder="e.g. 2024" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Location</label>
                                        <input type="text" name="ajidhas_content[technology][items][<?php echo $index; ?>][location]" value="<?php echo esc_attr($item_location); ?>" placeholder="e.g. Berlin" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Description</label>
                                    <textarea name="ajidhas_content[technology][items][<?php echo $index; ?>][desc]" rows="2" placeholder="Brief project summary"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Main Image</label>
                                    <input type="text" id="tech_item_img_<?php echo $index; ?>" name="ajidhas_content[technology][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local project asset" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('tech_item_img_<?php echo $index; ?>', 'tech_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('tech_item_img_<?php echo $index; ?>', 'tech_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="tech_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Landscape -->
                <div id="tab-landscape" class="ajidhas-tab-content ajidhas-card">
                    <h2>Landscape Section Settings</h2>
                    <div class="form-row">
                        <label>Landscape Section Title</label>
                        <input type="text" name="ajidhas_content[landscape][header_title]" value="<?php echo esc_attr($content['landscape']['header_title'] ?? 'Landscape Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Landscape Background Image</label>
                        <input type="text" id="landscape_bg" name="ajidhas_content[landscape][bg_image]" value="<?php echo esc_url($content['landscape']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('landscape_bg', 'landscape_bg_preview')">Choose Image</button>
                        <img id="landscape_bg_preview" class="img-preview" src="<?php echo esc_url($content['landscape']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['landscape']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🌲 Landscape Showcase Cluster (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addLandscapeItem()" style="background: #10b981;">+ Add New Landscape Item</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage floating cluster cards and full-screen project details on the Landscape Marquee page. Create, Edit, or Delete items dynamically.</p>

                    <div id="landscape-items-container">
                        <?php
                        $default_landscape_items = array(
                            array('title' => 'Silent Peaks', 'desc' => 'A serene exploration of mountain architecture.', 'location' => 'Switzerland', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Marcel E.', 'width' => 220, 'height' => 280, 'top' => '10%', 'left' => '5%', 'image' => ''),
                            array('title' => 'Urban Flow', 'desc' => 'Capturing the movement of city life.', 'location' => 'Tokyo, Japan', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Kenji T.', 'width' => 260, 'height' => 180, 'top' => '25%', 'left' => '45%', 'image' => ''),
                            array('title' => 'Desert Mirage', 'desc' => 'Heat and light playing tricks on the eye.', 'location' => 'Dubai, UAE', 'year' => '2023', 'type' => 'Landscape', 'photographer' => 'Sarah K.', 'width' => 200, 'height' => 200, 'top' => '60%', 'left' => '15%', 'image' => ''),
                            array('title' => 'Forest Edge', 'desc' => 'Where nature meets structure.', 'location' => 'Black Forest, Germany', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Hans M.', 'width' => 240, 'height' => 300, 'top' => '50%', 'left' => '70%', 'image' => ''),
                            array('title' => 'Ocean View', 'desc' => 'Infinite horizons and calming blues.', 'location' => 'Malibu, CA', 'year' => '2025', 'type' => 'Landscape', 'photographer' => 'David R.', 'width' => 180, 'height' => 220, 'top' => '15%', 'left' => '80%', 'image' => ''),
                            array('title' => 'Night Lights', 'desc' => 'The city comes alive after dark.', 'location' => 'Singapore', 'year' => '2024', 'type' => 'Landscape', 'photographer' => 'Elena S.', 'width' => 200, 'height' => 160, 'top' => '75%', 'left' => '40%', 'image' => ''),
                        );
                        $landscape_items = !empty($content['landscape']['items']) && is_array($content['landscape']['items']) ? $content['landscape']['items'] : $default_landscape_items;
                        foreach ($landscape_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_desc = $item['desc'] ?? '';
                            $item_location = $item['location'] ?? 'Switzerland';
                            $item_year = $item['year'] ?? '2024';
                            $item_type = $item['type'] ?? 'Landscape';
                            $item_photographer = $item['photographer'] ?? 'Marcel E.';
                            $item_width = $item['width'] ?? 220;
                            $item_height = $item['height'] ?? 280;
                            $item_top = $item['top'] ?? '10%';
                            $item_left = $item['left'] ?? '5%';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="landscape-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Landscape Card #<span class="landscape-item-index"><?php echo ($index + 1); ?></span>: <span class="landscape-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Card'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeLandscapeItem(this)">🗑️ Delete Card</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Card Title</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.landscape-item-card').querySelector('.landscape-item-title-preview').innerText = this.value || 'Untitled Card'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Location</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][location]" value="<?php echo esc_attr($item_location); ?>" placeholder="e.g. Switzerland" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Year</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][year]" value="<?php echo esc_attr($item_year); ?>" placeholder="e.g. 2024" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Photographer</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][photographer]" value="<?php echo esc_attr($item_photographer); ?>" placeholder="e.g. Marcel E." />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                                        <label>Project Type</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][type]" value="<?php echo esc_attr($item_type); ?>" placeholder="e.g. Landscape Architecture" />
                                    </div>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Width (px)</label>
                                        <input type="number" name="ajidhas_content[landscape][items][<?php echo $index; ?>][width]" value="<?php echo esc_attr($item_width); ?>" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Height (px)</label>
                                        <input type="number" name="ajidhas_content[landscape][items][<?php echo $index; ?>][height]" value="<?php echo esc_attr($item_height); ?>" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Top Pos (%)</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][top]" value="<?php echo esc_attr($item_top); ?>" placeholder="10%" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Left Pos (%)</label>
                                        <input type="text" name="ajidhas_content[landscape][items][<?php echo $index; ?>][left]" value="<?php echo esc_attr($item_left); ?>" placeholder="5%" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Project Description</label>
                                    <textarea name="ajidhas_content[landscape][items][<?php echo $index; ?>][desc]" rows="2" placeholder="Brief landscape project story"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Card Image</label>
                                    <input type="text" id="landscape_item_img_<?php echo $index; ?>" name="ajidhas_content[landscape][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local landscape asset" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('landscape_item_img_<?php echo $index; ?>', 'landscape_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('landscape_item_img_<?php echo $index; ?>', 'landscape_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="landscape_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Interior -->
                <div id="tab-interior" class="ajidhas-tab-content ajidhas-card">
                    <h2>Interior Section Settings</h2>
                    <div class="form-row">
                        <label>Interior Section Title</label>
                        <input type="text" name="ajidhas_content[interior][header_title]" value="<?php echo esc_attr($content['interior']['header_title'] ?? 'Interior Architecture'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Interior Background Image</label>
                        <input type="text" id="interior_bg" name="ajidhas_content[interior][bg_image]" value="<?php echo esc_url($content['interior']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('interior_bg', 'interior_bg_preview')">Choose Image</button>
                        <img id="interior_bg_preview" class="img-preview" src="<?php echo esc_url($content['interior']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['interior']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🛋️ Interior Showcase Slider (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addInteriorItem()" style="background: #10b981;">+ Add New Interior Slide</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage interior slider items and showcase projects on the Interior section page. Create, Edit, or Delete slides dynamically.</p>

                    <div id="interior-items-container">
                        <?php
                        $default_interior_items = array(
                            array('title' => 'Go-to-urban', 'subtitle' => 'Descubre la colección Evo', 'location' => 'Portola Valley, CA', 'image' => ''),
                            array('title' => 'Sublime', 'subtitle' => 'Elegance in every detail', 'location' => 'Howell Mountain, CA', 'image' => ''),
                            array('title' => 'Urban Echo', 'subtitle' => 'Modern living spaces', 'location' => 'Carmel-by-the-sea, CA', 'image' => ''),
                            array('title' => 'Nightfall', 'subtitle' => 'Shadows and light', 'location' => 'Silicon Valley, CA', 'image' => ''),
                        );
                        $interior_items = !empty($content['interior']['items']) && is_array($content['interior']['items']) ? $content['interior']['items'] : $default_interior_items;
                        foreach ($interior_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_subtitle = $item['subtitle'] ?? '';
                            $item_location = $item['location'] ?? 'California';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="interior-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Interior Slide #<span class="interior-item-index"><?php echo ($index + 1); ?></span>: <span class="interior-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Slide'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeInteriorItem(this)">🗑️ Delete Slide</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Slide Title</label>
                                        <input type="text" name="ajidhas_content[interior][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.interior-item-card').querySelector('.interior-item-title-preview').innerText = this.value || 'Untitled Slide'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Subtitle / Tagline</label>
                                        <input type="text" name="ajidhas_content[interior][items][<?php echo $index; ?>][subtitle]" value="<?php echo esc_attr($item_subtitle); ?>" placeholder="e.g. Elegance in every detail" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                                        <label>Location / City</label>
                                        <input type="text" name="ajidhas_content[interior][items][<?php echo $index; ?>][location]" value="<?php echo esc_attr($item_location); ?>" placeholder="e.g. Portola Valley, CA" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Slide Image</label>
                                    <input type="text" id="interior_item_img_<?php echo $index; ?>" name="ajidhas_content[interior][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local background image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('interior_item_img_<?php echo $index; ?>', 'interior_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('interior_item_img_<?php echo $index; ?>', 'interior_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="interior_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Collaboration -->
                <div id="tab-collab" class="ajidhas-tab-content ajidhas-card">
                    <h2>Collaboration Section Settings</h2>
                    <div class="form-row">
                        <label>Collaboration Title</label>
                        <input type="text" name="ajidhas_content[collaboration][header_title]" value="<?php echo esc_attr($content['collaboration']['header_title'] ?? 'Collaboration & Research'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Collaboration Background Image</label>
                        <input type="text" id="collab_bg" name="ajidhas_content[collaboration][bg_image]" value="<?php echo esc_url($content['collaboration']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('collab_bg', 'collab_bg_preview')">Choose Image</button>
                        <img id="collab_bg_preview" class="img-preview" src="<?php echo esc_url($content['collaboration']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['collaboration']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🤝 Collaboration Showcase Items (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addCollabItem()" style="background: #10b981;">+ Add New Collaboration Item</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage full-screen collaboration showcase sections displayed on the Collaboration page. Create, Edit, or Delete items dynamically.</p>

                    <div id="collab-items-container">
                        <?php
                        $default_collab_items = array(
                            array('title' => 'to the unknown', 'subtitle' => 'AND BACK', 'label' => 'BEYOND LIMITS', 'desc' => 'A collaborative journey into the depths of architectural surrealism, where boundaries between space and time dissolve into pure form.', 'image' => ''),
                            array('title' => 'in the clouds', 'subtitle' => 'GET LOST', 'label' => 'ETHEREAL FORMS', 'desc' => 'Dream the impossible dream with this artistic collaboration. We merge structural integrity with the ethereal nature of the sky.', 'image' => ''),
                            array('title' => 'silent echoes', 'subtitle' => 'LISTEN CLOSE', 'label' => 'MINIMAL RESONANCE', 'desc' => 'Exploring the resonance of minimalist structures in vast, silent landscapes. A study in acoustic and visual harmony.', 'image' => ''),
                            array('title' => 'liquid light', 'subtitle' => 'FLOW FREE', 'label' => 'DYNAMIC FLOW', 'desc' => 'Where architecture meets the fluid nature of light. A collaboration focused on dynamic transparency and reflection.', 'image' => ''),
                        );
                        $collab_items = !empty($content['collaboration']['items']) && is_array($content['collaboration']['items']) ? $content['collaboration']['items'] : $default_collab_items;
                        foreach ($collab_items as $index => $item) :
                            $item_title = $item['title'] ?? '';
                            $item_subtitle = $item['subtitle'] ?? '';
                            $item_label = $item['label'] ?? '';
                            $item_desc = $item['desc'] ?? '';
                            $item_img = $item['image'] ?? '';
                        ?>
                            <div class="collab-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <h4 style="margin: 0; color: #0f172a;">Collaboration Section #<span class="collab-item-index"><?php echo ($index + 1); ?></span>: <span class="collab-item-title-preview"><?php echo esc_html($item_title ?: 'Untitled Item'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeCollabItem(this)">🗑️ Delete Item</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Main Title</label>
                                        <input type="text" name="ajidhas_content[collaboration][items][<?php echo $index; ?>][title]" value="<?php echo esc_attr($item_title); ?>" oninput="this.closest('.collab-item-card').querySelector('.collab-item-title-preview').innerText = this.value || 'Untitled Item'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Subtitle / Tagline</label>
                                        <input type="text" name="ajidhas_content[collaboration][items][<?php echo $index; ?>][subtitle]" value="<?php echo esc_attr($item_subtitle); ?>" placeholder="e.g. AND BACK" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                                        <label>Label Tag / Badge</label>
                                        <input type="text" name="ajidhas_content[collaboration][items][<?php echo $index; ?>][label]" value="<?php echo esc_attr($item_label); ?>" placeholder="e.g. BEYOND LIMITS" />
                                    </div>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Section Description</label>
                                    <textarea name="ajidhas_content[collaboration][items][<?php echo $index; ?>][desc]" rows="2" placeholder="Description of the collaboration"><?php echo esc_textarea($item_desc); ?></textarea>
                                </div>
                                <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                                    <label>Section Background Image</label>
                                    <input type="text" id="collab_item_img_<?php echo $index; ?>" name="ajidhas_content[collaboration][items][<?php echo $index; ?>][image]" value="<?php echo esc_url($item_img); ?>" placeholder="Leave empty to use default local image" />
                                    <button type="button" class="upload-btn" onclick="selectMedia('collab_item_img_<?php echo $index; ?>', 'collab_item_preview_<?php echo $index; ?>')">Choose Image</button>
                                    <button type="button" class="clear-btn" onclick="clearMedia('collab_item_img_<?php echo $index; ?>', 'collab_item_preview_<?php echo $index; ?>')">Clear</button>
                                    <img id="collab_item_preview_<?php echo $index; ?>" class="img-preview" src="<?php echo esc_url($item_img); ?>" style="<?php echo empty($item_img) ? 'display:none;' : ''; ?>" />
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Tab Contact -->
                <div id="tab-contact" class="ajidhas-tab-content ajidhas-card">
                    <h2>Contact Section & Map Settings</h2>
                    <div class="form-row">
                        <label>Contact Title</label>
                        <input type="text" name="ajidhas_content[contact][title]" value="<?php echo esc_attr($content['contact']['title'] ?? "Get in Touch"); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Visit Section Title</label>
                        <input type="text" name="ajidhas_content[contact][visit_title]" value="<?php echo esc_attr($content['contact']['visit_title'] ?? "Visit Us"); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Background Image</label>
                        <input type="text" id="contact_bg" name="ajidhas_content[contact][bg_image]" value="<?php echo esc_url($content['contact']['bg_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('contact_bg', 'contact_bg_preview')">Choose Image</button>
                        <img id="contact_bg_preview" class="img-preview" src="<?php echo esc_url($content['contact']['bg_image'] ?? ''); ?>" style="<?php echo empty($content['contact']['bg_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Map Background Image</label>
                        <input type="text" id="contact_map_bg" name="ajidhas_content[contact][map_image]" value="<?php echo esc_url($content['contact']['map_image'] ?? ''); ?>" />
                        <button type="button" class="upload-btn" onclick="selectMedia('contact_map_bg', 'contact_map_bg_preview')">Choose Image</button>
                        <img id="contact_map_bg_preview" class="img-preview" src="<?php echo esc_url($content['contact']['map_image'] ?? ''); ?>" style="<?php echo empty($content['contact']['map_image']) ? 'display:none;' : ''; ?>" />
                    </div>
                    <div class="form-row">
                        <label>Google Maps URL</label>
                        <input type="text" name="ajidhas_content[contact][google_maps_url]" value="<?php echo esc_url($content['contact']['google_maps_url'] ?? 'https://maps.google.com'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Instagram URL</label>
                        <input type="text" name="ajidhas_content[contact][social_instagram]" value="<?php echo esc_url($content['contact']['social_instagram'] ?? 'https://www.instagram.com/ajidhas_sand_associates/'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>LinkedIn URL</label>
                        <input type="text" name="ajidhas_content[contact][social_linkedin]" value="<?php echo esc_url($content['contact']['social_linkedin'] ?? 'https://www.linkedin.com/company/ajidhas-sand-associates/'); ?>" />
                    </div>
                </div>

                <!-- Tab Footer -->
                <div id="tab-footer" class="ajidhas-tab-content ajidhas-card">
                    <h2>Footer Section & Navigation Links Manager</h2>
                    <div class="form-row">
                        <label>Footer Brand Headline</label>
                        <input type="text" name="ajidhas_content[footer][brand_title]" value="<?php echo esc_attr($content['footer']['brand_title'] ?? 'Ajidhas & Associates'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Explore Column Title</label>
                        <input type="text" name="ajidhas_content[footer][explore_title]" value="<?php echo esc_attr($content['footer']['explore_title'] ?? 'Explore'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Contact Column Title</label>
                        <input type="text" name="ajidhas_content[footer][contact_title]" value="<?php echo esc_attr($content['footer']['contact_title'] ?? 'Contact'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Newsletter Column Title</label>
                        <input type="text" name="ajidhas_content[footer][newsletter_title]" value="<?php echo esc_attr($content['footer']['newsletter_title'] ?? 'Newsletter'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Newsletter Description</label>
                        <textarea name="ajidhas_content[footer][newsletter_desc]" rows="2"><?php echo esc_textarea($content['footer']['newsletter_desc'] ?? 'Subscribe to receive updates on new projects and exhibitions.'); ?></textarea>
                    </div>
                    <div class="form-row">
                        <label>Copyright Text</label>
                        <input type="text" name="ajidhas_content[footer][copyright_text]" value="<?php echo esc_attr($content['footer']['copyright_text'] ?? '© 2026 Ajidhas & Associates Studio. All rights reserved.'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Privacy Policy URL</label>
                        <input type="text" name="ajidhas_content[footer][privacy_url]" value="<?php echo esc_url($content['footer']['privacy_url'] ?? '#'); ?>" />
                    </div>
                    <div class="form-row">
                        <label>Terms of Service URL</label>
                        <input type="text" name="ajidhas_content[footer][terms_url]" value="<?php echo esc_url($content['footer']['terms_url'] ?? '#'); ?>" />
                    </div>

                    <hr style="margin: 25px 0; border: 0; border-top: 1px solid #e2e8f0;" />
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0;">🔗 Explore Navigation Links (CRUD Manager)</h3>
                        <button type="button" class="upload-btn" onclick="addFooterLink()" style="background: #10b981;">+ Add New Link</button>
                    </div>
                    <p style="color: #64748b; font-size: 13px; margin-bottom: 16px;">Manage footer navigation items displayed in the Explore section.</p>

                    <div id="footer-links-container">
                        <?php
                        $default_explore_links = array(
                            array('label' => 'Architecture', 'url' => '/architecture'),
                            array('label' => 'Art Collection', 'url' => '/art'),
                            array('label' => 'Gallery', 'url' => '/art/gallery'),
                            array('label' => 'The Artist', 'url' => '/art/artist')
                        );
                        $explore_links = !empty($content['footer']['explore_links']) && is_array($content['footer']['explore_links']) ? $content['footer']['explore_links'] : $default_explore_links;
                        foreach ($explore_links as $index => $link_item) :
                            $l_label = $link_item['label'] ?? '';
                            $l_url = $link_item['url'] ?? '';
                        ?>
                            <div class="footer-link-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; margin-bottom: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                    <h4 style="margin: 0; color: #0f172a;">Link #<span class="footer-link-index"><?php echo ($index + 1); ?></span>: <span class="footer-link-label-preview"><?php echo esc_html($l_label ?: 'Untitled Link'); ?></span></h4>
                                    <button type="button" class="clear-btn" onclick="removeFooterLink(this)">🗑️ Delete Link</button>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Link Text / Label</label>
                                        <input type="text" name="ajidhas_content[footer][explore_links][<?php echo $index; ?>][label]" value="<?php echo esc_attr($l_label); ?>" oninput="this.closest('.footer-link-card').querySelector('.footer-link-label-preview').innerText = this.value || 'Untitled Link'" />
                                    </div>
                                    <div class="form-row" style="margin-bottom: 0;">
                                        <label>Target URL / Route</label>
                                        <input type="text" name="ajidhas_content[footer][explore_links][<?php echo $index; ?>][url]" value="<?php echo esc_attr($l_url); ?>" placeholder="e.g. /architecture" />
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <p><input type="submit" name="ajidhas_save_content" class="btn-save" value="💾 Save All Section Text & Media Changes" /></p>
            </form>
        </div>

        <script>
        function openTab(evt, tabId) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("ajidhas-tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("ajidhas-tab-btn");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].classList.remove("active");
            }
            document.getElementById(tabId).classList.add("active");
            evt.currentTarget.classList.add("active");
        }

        function selectMedia(inputId, previewId) {
            var frame = wp.media({
                title: 'Select or Upload Media Asset',
                button: { text: 'Use Selected Media' },
                multiple: false
            });

            frame.on('select', function() {
                var attachment = frame.state().get('selection').first().toJSON();
                document.getElementById(inputId).value = attachment.url;
                var preview = document.getElementById(previewId);
                if (preview) {
                    preview.src = attachment.url;
                    preview.style.display = 'block';
                }
            });

            frame.open();
        }

        function clearMedia(inputId, previewId) {
            document.getElementById(inputId).value = '';
            var preview = document.getElementById(previewId);
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        }

        function addArtItem() {
            var container = document.getElementById('art-items-container');
            var count = container.querySelectorAll('.art-item-card').length;
            var index = Date.now();
            var html = `
                <div class="art-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Artwork #<span class="art-item-index">${count + 1}</span>: <span class="art-item-title-preview">New Artwork</span></h4>
                        <button type="button" class="clear-btn" onclick="removeArtItem(this)">🗑️ Delete Artwork</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Title</label>
                            <input type="text" name="ajidhas_content[art][items][${index}][title]" value="" placeholder="e.g. Ethereal Silence" oninput="this.closest('.art-item-card').querySelector('.art-item-title-preview').innerText = this.value || 'Untitled Piece'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Artist</label>
                            <input type="text" name="ajidhas_content[art][items][${index}][artist]" value="Ajidhas" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Year</label>
                            <input type="text" name="ajidhas_content[art][items][${index}][year]" value="${new Date().getFullYear()}" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Medium</label>
                            <input type="text" name="ajidhas_content[art][items][${index}][medium]" value="Mixed Media" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Artwork Image</label>
                        <input type="text" id="art_item_img_${index}" name="ajidhas_content[art][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('art_item_img_${index}', 'art_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('art_item_img_${index}', 'art_item_preview_${index}')">Clear</button>
                        <img id="art_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeArtItem(btn) {
            if (confirm('Are you sure you want to delete this artwork?')) {
                var card = btn.closest('.art-item-card');
                card.remove();
                reindexArtItems();
            }
        }

        function reindexArtItems() {
            var container = document.getElementById('art-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.art-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.art-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addGalleryItem() {
            var container = document.getElementById('gallery-items-container');
            var count = container.querySelectorAll('.gallery-item-card').length;
            var index = Date.now();
            var seriesNum = (count + 1).toString().padStart(2, '0');
            var html = `
                <div class="gallery-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Series Item #<span class="gallery-item-index">${count + 1}</span>: <span class="gallery-item-title-preview">New Series Item</span></h4>
                        <button type="button" class="clear-btn" onclick="removeGalleryItem(this)">🗑️ Delete Series Item</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Title</label>
                            <input type="text" name="ajidhas_content[gallery][items][${index}][title]" value="" placeholder="e.g. Hatha Yoga" oninput="this.closest('.gallery-item-card').querySelector('.gallery-item-title-preview').innerText = this.value || 'Untitled Series'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Label / Series Badge</label>
                            <input type="text" name="ajidhas_content[gallery][items][${index}][label]" value="Series ${seriesNum}" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Series Image</label>
                        <input type="text" id="gallery_item_img_${index}" name="ajidhas_content[gallery][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('gallery_item_img_${index}', 'gallery_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('gallery_item_img_${index}', 'gallery_item_preview_${index}')">Clear</button>
                        <img id="gallery_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeGalleryItem(btn) {
            if (confirm('Are you sure you want to delete this series item?')) {
                var card = btn.closest('.gallery-item-card');
                card.remove();
                reindexGalleryItems();
            }
        }

        function reindexGalleryItems() {
            var container = document.getElementById('gallery-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.gallery-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.gallery-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addArchProject() {
            var container = document.getElementById('arch-projects-container');
            var count = container.querySelectorAll('.arch-project-card').length;
            var index = Date.now();
            var html = `
                <div class="arch-project-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Project #<span class="arch-project-index">${count + 1}</span>: <span class="arch-project-title-preview">New Project</span></h4>
                        <button type="button" class="clear-btn" onclick="removeArchProject(this)">🗑️ Delete Project</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Project Title</label>
                            <input type="text" name="ajidhas_content[architecture_all][projects][${index}][title]" value="" placeholder="e.g. The Glass Pavilion" oninput="this.closest('.arch-project-card').querySelector('.arch-project-title-preview').innerText = this.value || 'Untitled Project'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Project Type</label>
                            <input type="text" name="ajidhas_content[architecture_all][projects][${index}][type]" value="Residential" placeholder="e.g. Residential, Commercial" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Location</label>
                            <input type="text" name="ajidhas_content[architecture_all][projects][${index}][location]" value="Europe" placeholder="e.g. Europe" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Year / Status</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" name="ajidhas_content[architecture_all][projects][${index}][year]" value="2025" placeholder="Year" style="width: 40%;" />
                                <input type="text" name="ajidhas_content[architecture_all][projects][${index}][status]" value="Completed" placeholder="Status" style="width: 60%;" />
                            </div>
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Description / Story</label>
                        <textarea name="ajidhas_content[architecture_all][projects][${index}][desc]" rows="2" placeholder="Brief project description"></textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Project Image</label>
                        <input type="text" id="arch_proj_img_${index}" name="ajidhas_content[architecture_all][projects][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('arch_proj_img_${index}', 'arch_proj_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('arch_proj_img_${index}', 'arch_proj_preview_${index}')">Clear</button>
                        <img id="arch_proj_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeArchProject(btn) {
            if (confirm('Are you sure you want to delete this project?')) {
                var card = btn.closest('.arch-project-card');
                card.remove();
                reindexArchProjects();
            }
        }

        function reindexArchProjects() {
            var container = document.getElementById('arch-projects-container');
            if (!container) return;
            var cards = container.querySelectorAll('.arch-project-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.arch-project-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addEditorialProject() {
            var container = document.getElementById('editorial-projects-container');
            var count = container.querySelectorAll('.editorial-project-card').length;
            var index = Date.now();
            var html = `
                <div class="editorial-project-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Editorial Project #<span class="editorial-project-index">${count + 1}</span>: <span class="editorial-project-title-preview">New Project</span></h4>
                        <button type="button" class="clear-btn" onclick="removeEditorialProject(this)">🗑️ Delete Project</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Project Title</label>
                            <input type="text" name="ajidhas_content[architecture][projects][${index}][title]" value="" placeholder="e.g. casa serena" oninput="this.closest('.editorial-project-card').querySelector('.editorial-project-title-preview').innerText = this.value || 'Untitled Project'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Designer Name</label>
                            <input type="text" name="ajidhas_content[architecture][projects][${index}][designer]" value="ANTONI MARTÍNEZ" placeholder="e.g. ANTONI MARTÍNEZ" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Location & Year</label>
                            <div style="display: flex; gap: 8px;">
                                <input type="text" name="ajidhas_content[architecture][projects][${index}][location]" value="BARCELONA" placeholder="Location" style="width: 60%;" />
                                <input type="text" name="ajidhas_content[architecture][projects][${index}][year]" value="2025" placeholder="Year" style="width: 40%;" />
                            </div>
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>GPS Coordinates</label>
                            <input type="text" name="ajidhas_content[architecture][projects][${index}][coords]" value="41.3851° N, 2.1734° E" placeholder="e.g. 41.3851° N, 2.1734° E" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Editorial Description</label>
                        <textarea name="ajidhas_content[architecture][projects][${index}][description]" rows="2" placeholder="Brief project description"></textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Project Hero Image</label>
                        <input type="text" id="editorial_proj_img_${index}" name="ajidhas_content[architecture][projects][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('editorial_proj_img_${index}', 'editorial_proj_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('editorial_proj_img_${index}', 'editorial_proj_preview_${index}')">Clear</button>
                        <img id="editorial_proj_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeEditorialProject(btn) {
            if (confirm('Are you sure you want to delete this editorial project?')) {
                var card = btn.closest('.editorial-project-card');
                card.remove();
                reindexEditorialProjects();
            }
        }

        function reindexEditorialProjects() {
            var container = document.getElementById('editorial-projects-container');
            if (!container) return;
            var cards = container.querySelectorAll('.editorial-project-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.editorial-project-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addCollabItem() {
            var container = document.getElementById('collab-items-container');
            var count = container.querySelectorAll('.collab-item-card').length;
            var index = Date.now();
            var html = `
                <div class="collab-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Collaboration Section #<span class="collab-item-index">${count + 1}</span>: <span class="collab-item-title-preview">New Item</span></h4>
                        <button type="button" class="clear-btn" onclick="removeCollabItem(this)">🗑️ Delete Item</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Main Title</label>
                            <input type="text" name="ajidhas_content[collaboration][items][${index}][title]" value="" placeholder="e.g. to the unknown" oninput="this.closest('.collab-item-card').querySelector('.collab-item-title-preview').innerText = this.value || 'Untitled Item'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Subtitle / Tagline</label>
                            <input type="text" name="ajidhas_content[collaboration][items][${index}][subtitle]" value="AND BEYOND" placeholder="e.g. AND BACK" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                            <label>Label Tag / Badge</label>
                            <input type="text" name="ajidhas_content[collaboration][items][${index}][label]" value="COLLABORATION" placeholder="e.g. BEYOND LIMITS" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Section Description</label>
                        <textarea name="ajidhas_content[collaboration][items][${index}][desc]" rows="2" placeholder="Description of the collaboration"></textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Section Background Image</label>
                        <input type="text" id="collab_item_img_${index}" name="ajidhas_content[collaboration][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('collab_item_img_${index}', 'collab_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('collab_item_img_${index}', 'collab_item_preview_${index}')">Clear</button>
                        <img id="collab_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeCollabItem(btn) {
            if (confirm('Are you sure you want to delete this collaboration section?')) {
                var card = btn.closest('.collab-item-card');
                card.remove();
                reindexCollabItems();
            }
        }

        function reindexCollabItems() {
            var container = document.getElementById('collab-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.collab-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.collab-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addInteriorItem() {
            var container = document.getElementById('interior-items-container');
            var count = container.querySelectorAll('.interior-item-card').length;
            var index = Date.now();
            var html = `
                <div class="interior-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Interior Slide #<span class="interior-item-index">${count + 1}</span>: <span class="interior-item-title-preview">New Slide</span></h4>
                        <button type="button" class="clear-btn" onclick="removeInteriorItem(this)">🗑️ Delete Slide</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Slide Title</label>
                            <input type="text" name="ajidhas_content[interior][items][${index}][title]" value="" placeholder="e.g. Go-to-urban" oninput="this.closest('.interior-item-card').querySelector('.interior-item-title-preview').innerText = this.value || 'Untitled Slide'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Subtitle / Tagline</label>
                            <input type="text" name="ajidhas_content[interior][items][${index}][subtitle]" value="" placeholder="e.g. Elegance in every detail" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                            <label>Location / City</label>
                            <input type="text" name="ajidhas_content[interior][items][${index}][location]" value="California" placeholder="e.g. Portola Valley, CA" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Slide Image</label>
                        <input type="text" id="interior_item_img_${index}" name="ajidhas_content[interior][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('interior_item_img_${index}', 'interior_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('interior_item_img_${index}', 'interior_item_preview_${index}')">Clear</button>
                        <img id="interior_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeInteriorItem(btn) {
            if (confirm('Are you sure you want to delete this interior slide?')) {
                var card = btn.closest('.interior-item-card');
                card.remove();
                reindexInteriorItems();
            }
        }

        function reindexInteriorItems() {
            var container = document.getElementById('interior-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.interior-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.interior-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addLandscapeItem() {
            var container = document.getElementById('landscape-items-container');
            var count = container.querySelectorAll('.landscape-item-card').length;
            var index = Date.now();
            var html = `
                <div class="landscape-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Landscape Card #<span class="landscape-item-index">${count + 1}</span>: <span class="landscape-item-title-preview">New Card</span></h4>
                        <button type="button" class="clear-btn" onclick="removeLandscapeItem(this)">🗑️ Delete Card</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Card Title</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][title]" value="" placeholder="e.g. Silent Peaks" oninput="this.closest('.landscape-item-card').querySelector('.landscape-item-title-preview').innerText = this.value || 'Untitled Card'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Location</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][location]" value="Switzerland" placeholder="e.g. Switzerland" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Year</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][year]" value="2024" placeholder="e.g. 2024" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Photographer</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][photographer]" value="Marcel E." placeholder="e.g. Marcel E." />
                        </div>
                        <div class="form-row" style="margin-bottom: 0; grid-column: span 2;">
                            <label>Project Type</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][type]" value="Landscape" placeholder="e.g. Landscape Architecture" />
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-top: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Width (px)</label>
                            <input type="number" name="ajidhas_content[landscape][items][${index}][width]" value="220" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Height (px)</label>
                            <input type="number" name="ajidhas_content[landscape][items][${index}][height]" value="280" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Top Pos (%)</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][top]" value="10%" placeholder="10%" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Left Pos (%)</label>
                            <input type="text" name="ajidhas_content[landscape][items][${index}][left]" value="5%" placeholder="5%" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Project Description</label>
                        <textarea name="ajidhas_content[landscape][items][${index}][desc]" rows="2" placeholder="Brief landscape project story">A serene exploration of mountain architecture.</textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Card Image</label>
                        <input type="text" id="landscape_item_img_${index}" name="ajidhas_content[landscape][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('landscape_item_img_${index}', 'landscape_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('landscape_item_img_${index}', 'landscape_item_preview_${index}')">Clear</button>
                        <img id="landscape_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeLandscapeItem(btn) {
            if (confirm('Are you sure you want to delete this landscape card?')) {
                var card = btn.closest('.landscape-item-card');
                card.remove();
                reindexLandscapeItems();
            }
        }

        function reindexLandscapeItems() {
            var container = document.getElementById('landscape-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.landscape-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.landscape-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addTechItem() {
            var container = document.getElementById('tech-items-container');
            var count = container.querySelectorAll('.tech-item-card').length;
            var index = Date.now();
            var html = `
                <div class="tech-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Tech Item #<span class="tech-item-index">${count + 1}</span>: <span class="tech-item-title-preview">New Tech Item</span></h4>
                        <button type="button" class="clear-btn" onclick="removeTechItem(this)">🗑️ Delete Item</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Title</label>
                            <input type="text" name="ajidhas_content[technology][items][${index}][title]" value="" placeholder="e.g. Notes on Vision" oninput="this.closest('.tech-item-card').querySelector('.tech-item-title-preview').innerText = this.value || 'Untitled Item'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Subtitle / Count</label>
                            <input type="text" name="ajidhas_content[technology][items][${index}][subtitle]" value="12 Images" placeholder="e.g. 12 Images" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Year</label>
                            <input type="text" name="ajidhas_content[technology][items][${index}][year]" value="2024" placeholder="e.g. 2024" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Location</label>
                            <input type="text" name="ajidhas_content[technology][items][${index}][location]" value="Berlin" placeholder="e.g. Berlin" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Description</label>
                        <textarea name="ajidhas_content[technology][items][${index}][desc]" rows="2" placeholder="Brief project summary">Exploring the boundaries of visual perception through architectural lens.</textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Main Image</label>
                        <input type="text" id="tech_item_img_${index}" name="ajidhas_content[technology][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('tech_item_img_${index}', 'tech_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('tech_item_img_${index}', 'tech_item_preview_${index}')">Clear</button>
                        <img id="tech_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeTechItem(btn) {
            if (confirm('Are you sure you want to delete this tech item?')) {
                var card = btn.closest('.tech-item-card');
                card.remove();
                reindexTechItems();
            }
        }

        function reindexTechItems() {
            var container = document.getElementById('tech-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.tech-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.tech-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addVisItem() {
            var container = document.getElementById('vis-items-container');
            var count = container.querySelectorAll('.vis-item-card').length;
            var index = Date.now();
            var html = `
                <div class="vis-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Render Item #<span class="vis-item-index">${count + 1}</span>: <span class="vis-item-title-preview">New Render Item</span></h4>
                        <button type="button" class="clear-btn" onclick="removeVisItem(this)">🗑️ Delete Render Item</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Render Title</label>
                            <input type="text" name="ajidhas_content[visualisation][items][${index}][title]" value="" placeholder="e.g. Haus am See" oninput="this.closest('.vis-item-card').querySelector('.vis-item-title-preview').innerText = this.value || 'Untitled Render'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Category (e.g. RESIDENTIAL, CORPORATE)</label>
                            <input type="text" name="ajidhas_content[visualisation][items][${index}][category]" value="RESIDENTIAL" placeholder="e.g. RESIDENTIAL" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Description</label>
                        <textarea name="ajidhas_content[visualisation][items][${index}][desc]" rows="2" placeholder="Brief render description">A minimalist architectural 3D render visualisation.</textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Render Image</label>
                        <input type="text" id="vis_item_img_${index}" name="ajidhas_content[visualisation][items][${index}][image]" value="" placeholder="Choose Image from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('vis_item_img_${index}', 'vis_item_preview_${index}')">Choose Image</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('vis_item_img_${index}', 'vis_item_preview_${index}')">Clear</button>
                        <img id="vis_item_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeVisItem(btn) {
            if (confirm('Are you sure you want to delete this render item?')) {
                var card = btn.closest('.vis-item-card');
                card.remove();
                reindexVisItems();
            }
        }

        function reindexVisItems() {
            var container = document.getElementById('vis-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.vis-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.vis-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addTeamItem() {
            var container = document.getElementById('team-items-container');
            var count = container.querySelectorAll('.team-item-card').length;
            var index = Date.now();
            var html = `
                <div class="team-item-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h4 style="margin: 0; color: #0f172a;">Member #<span class="team-item-index">${count + 1}</span>: <span class="team-item-name-preview">New Team Member</span></h4>
                        <button type="button" class="clear-btn" onclick="removeTeamItem(this)">🗑️ Delete Member</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Full Name</label>
                            <input type="text" name="ajidhas_content[about][team][${index}][name]" value="" placeholder="e.g. Alex Morgan" oninput="this.closest('.team-item-card').querySelector('.team-item-name-preview').innerText = this.value || 'Untitled Member'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Role / Position</label>
                            <input type="text" name="ajidhas_content[about][team][${index}][role]" value="Architect" placeholder="e.g. Senior Architect" />
                        </div>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Biography</label>
                        <textarea name="ajidhas_content[about][team][${index}][bio]" rows="2" placeholder="Brief member biography">A dedicated design professional committed to architectural excellence.</textarea>
                    </div>
                    <div class="form-row" style="margin-top: 12px; margin-bottom: 0;">
                        <label>Photo</label>
                        <input type="text" id="team_img_${index}" name="ajidhas_content[about][team][${index}][image]" value="" placeholder="Choose Photo from WP Media" />
                        <button type="button" class="upload-btn" onclick="selectMedia('team_img_${index}', 'team_img_preview_${index}')">Choose Photo</button>
                        <button type="button" class="clear-btn" onclick="clearMedia('team_img_${index}', 'team_img_preview_${index}')">Clear</button>
                        <img id="team_img_preview_${index}" class="img-preview" src="" style="display:none;" />
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeTeamItem(btn) {
            if (confirm('Are you sure you want to delete this team member?')) {
                var card = btn.closest('.team-item-card');
                card.remove();
                reindexTeamItems();
            }
        }

        function reindexTeamItems() {
            var container = document.getElementById('team-items-container');
            if (!container) return;
            var cards = container.querySelectorAll('.team-item-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.team-item-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }

        function addFooterLink() {
            var container = document.getElementById('footer-links-container');
            var count = container.querySelectorAll('.footer-link-card').length;
            var index = Date.now();
            var html = `
                <div class="footer-link-card" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #0f172a;">Link #<span class="footer-link-index">${count + 1}</span>: <span class="footer-link-label-preview">New Link</span></h4>
                        <button type="button" class="clear-btn" onclick="removeFooterLink(this)">🗑️ Delete Link</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Link Text / Label</label>
                            <input type="text" name="ajidhas_content[footer][explore_links][${index}][label]" value="" placeholder="e.g. Portfolio" oninput="this.closest('.footer-link-card').querySelector('.footer-link-label-preview').innerText = this.value || 'Untitled Link'" />
                        </div>
                        <div class="form-row" style="margin-bottom: 0;">
                            <label>Target URL / Route</label>
                            <input type="text" name="ajidhas_content[footer][explore_links][${index}][url]" value="/" placeholder="e.g. /architecture" />
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeFooterLink(btn) {
            if (confirm('Are you sure you want to delete this navigation link?')) {
                var card = btn.closest('.footer-link-card');
                card.remove();
                reindexFooterLinks();
            }
        }

        function reindexFooterLinks() {
            var container = document.getElementById('footer-links-container');
            if (!container) return;
            var cards = container.querySelectorAll('.footer-link-card');
            cards.forEach(function(card, idx) {
                var indexEl = card.querySelector('.footer-link-index');
                if (indexEl) indexEl.innerText = idx + 1;
            });
        }
        </script>
        <?php
    }

    /**
     * Render Leads CRM Page
     */
    public function render_leads_crm_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';

        if (isset($_GET['action'], $_GET['lead_id']) && $_GET['action'] === 'update_status' && check_admin_referer('update_lead_' . $_GET['lead_id'])) {
            $new_status = sanitize_text_field($_GET['status']);
            $lead_id = intval($_GET['lead_id']);
            $wpdb->update($table_name, array('status' => $new_status), array('id' => $lead_id));
            echo '<div class="updated"><p>Lead status updated to <strong>' . esc_html($new_status) . '</strong>.</p></div>';
        }

        if (isset($_GET['action'], $_GET['lead_id']) && $_GET['action'] === 'delete_lead' && check_admin_referer('delete_lead_' . $_GET['lead_id'])) {
            $lead_id = intval($_GET['lead_id']);
            $wpdb->delete($table_name, array('id' => $lead_id));
            echo '<div class="updated"><p>Lead record deleted.</p></div>';
        }

        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");

        ?>
        <div class="wrap ajidhas-wrap">
            <h1> Client Leads & Form Inquiries CRM</h1>
            <p>All client inquiries received from your React contact forms are stored here securely in real-time.</p>

            <div class="ajidhas-card">
                <?php if (empty($leads)) : ?>
                    <p style="color: #666; font-style: italic;">No inquiries received yet. Test your contact form from the frontend website!</p>
                <?php else : ?>
                    <table class="crm-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Client Name</th>
                                <th>Email Address</th>
                                <th>Inquiry Type</th>
                                <th>Subject & Message</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($leads as $lead) : ?>
                                <tr>
                                    <td><small><?php echo esc_html(date('M j, Y g:i a', strtotime($lead->created_at))); ?></small></td>
                                    <td><strong><?php echo esc_html($lead->name); ?></strong></td>
                                    <td><a href="mailto:<?php echo esc_attr($lead->email); ?>"><?php echo esc_html($lead->email); ?></a></td>
                                    <td><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 12px;"><?php echo esc_html(ucfirst($lead->type)); ?></span></td>
                                    <td>
                                        <strong><?php echo esc_html($lead->subject); ?></strong>
                                        <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; max-width: 350px;"><?php echo nl2br(esc_html($lead->message)); ?></p>
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?php echo esc_attr($lead->status); ?>">
                                            <?php echo esc_html(str_replace('_', ' ', $lead->status)); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <select onchange="window.location.href=this.value;" style="font-size: 12px; padding: 4px;">
                                            <option value="">Change Status...</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=new'), 'update_lead_' . $lead->id)); ?>">Mark as New</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=contacted'), 'update_lead_' . $lead->id)); ?>">Mark Contacted</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=in_progress'), 'update_lead_' . $lead->id)); ?>">In Progress</option>
                                            <option value="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=update_status&lead_id=' . $lead->id . '&status=closed'), 'update_lead_' . $lead->id)); ?>">Closed / Won</option>
                                        </select>
                                        <a href="<?php echo esc_url(wp_nonce_url(admin_url('admin.php?page=ajidhas-crm-leads&action=delete_lead&lead_id=' . $lead->id), 'delete_lead_' . $lead->id)); ?>" onclick="return confirm('Are you sure you want to delete this lead?');" style="color: #ef4444; margin-left: 8px; text-decoration: none; font-size: 12px;">Delete</a>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    /**
     * Setup REST API Routes
     */
    public function register_rest_routes() {
        register_rest_route('ajidhas/v1', '/content', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_site_content'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('ajidhas/v1', '/content', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_site_content_api'),
            'permission_callback' => function() {
                return current_user_can('edit_posts');
            },
        ));

        register_rest_route('ajidhas/v1', '/projects', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_projects_api'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route('ajidhas/v1', '/inquiry', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_inquiry_submission'),
            'permission_callback' => '__return_true',
            'args' => array(
                'name' => array('required' => true, 'sanitize_callback' => 'sanitize_text_field'),
                'email' => array('required' => true, 'sanitize_callback' => 'sanitize_email'),
                'message' => array('required' => true, 'sanitize_callback' => 'sanitize_textarea_field'),
            )
        ));

        register_rest_route('ajidhas/v1', '/inquiries', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_inquiries_api'),
            'permission_callback' => function() {
                return current_user_can('manage_options');
            },
        ));
    }

    public function get_site_content() {
        nocache_headers();
        $content = $this->get_merged_content();
        return rest_ensure_response(array('status' => 'success', 'data' => $content));
    }

    public function update_site_content_api(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params)) {
            return new WP_Error('empty_data', 'No content payload sent', array('status' => 400));
        }
        $existing = get_option($this->option_key, array());
        $updated = array_merge($existing, $params);
        update_option($this->option_key, $updated);
        return rest_ensure_response(array('status' => 'success', 'data' => $updated));
    }

    public function get_projects_api() {
        nocache_headers();
        $args = array(
            'post_type' => 'ajidhas_project',
            'posts_per_page' => -1,
            'post_status' => 'publish',
        );
        $query = new WP_Query($args);
        $projects = array();

        foreach ($query->posts as $post) {
            $thumbnail_id = get_post_thumbnail_id($post->ID);
            $thumbnail_url = $thumbnail_id ? wp_get_attachment_image_url($thumbnail_id, 'full') : '';

            $projects[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'description' => $post->post_excerpt ?: $post->post_content,
                'image' => $thumbnail_url,
                'category' => get_post_meta($post->ID, 'project_category', true) ?: 'Architecture',
                'bg_image' => get_post_meta($post->ID, 'project_bg_image', true) ?: '',
                'year' => get_post_meta($post->ID, 'project_year', true) ?: date('Y'),
                'location' => get_post_meta($post->ID, 'project_location', true) ?: '',
            );
        }

        return rest_ensure_response(array('status' => 'success', 'projects' => $projects));
    }

    public function handle_inquiry_submission(WP_REST_Request $request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';

        $name = sanitize_text_field($request->get_param('name'));
        $email = sanitize_email($request->get_param('email'));
        $phone = sanitize_text_field($request->get_param('phone') ?: '');
        $subject = sanitize_text_field($request->get_param('subject') ?: 'New Project Inquiry');
        $message = sanitize_textarea_field($request->get_param('message'));
        $type = sanitize_text_field($request->get_param('type') ?: 'general');

        if (!is_email($email)) {
            return new WP_Error('invalid_email', 'Please provide a valid email address.', array('status' => 400));
        }

        $inserted = $wpdb->insert(
            $table_name,
            array(
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'subject' => $subject,
                'message' => $message,
                'type' => $type,
                'status' => 'new',
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );

        if (!$inserted) {
            return new WP_Error('db_error', 'Could not save inquiry lead.', array('status' => 500));
        }

        $lead_id = $wpdb->insert_id;

        $admin_email = get_option('admin_email');
        $email_subject = "[New Lead #$lead_id] $subject — $name";
        $email_body = "You have received a new inquiry from your website CRM:\n\n";
        $email_body .= "Name: $name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Phone: $phone\n";
        $email_body .= "Type: $type\n";
        $email_body .= "Subject: $subject\n\n";
        $email_body .= "Message:\n$message\n\n";
        $email_body .= "---\nView and manage lead in WP Admin: " . admin_url('admin.php?page=ajidhas-crm-leads');

        wp_mail($admin_email, $email_subject, $email_body);

        $reply_subject = "Thank you for reaching out to Ajidhas & Associates";
        $reply_body = "Hello $name,\n\nThank you for contacting Ajidhas & Associates. We have received your inquiry regarding \"$subject\" and our team will get back to you within 1-2 business days.\n\nBest regards,\nAjidhas & Associates Studio\nChennai, India";
        wp_mail($email, $reply_subject, $reply_body);

        if (function_exists('FluentCrmApi')) {
            try {
                $subscriber_data = array(
                    'email' => $email,
                    'first_name' => $name,
                    'status' => 'subscribed',
                    'tags' => array('website-lead', $type . '-inquiry'),
                );
                FluentCrmApi('contacts')->createOrUpdate($subscriber_data);
            } catch (Exception $e) {
                error_log('FluentCRM Integration Error: ' . $e->getMessage());
            }
        }

        return rest_ensure_response(array(
            'status' => 'success',
            'message' => 'Thank you! Your inquiry has been submitted successfully.',
            'lead_id' => $lead_id
        ));
    }

    public function get_inquiries_api() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'ajidhas_inquiries';
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        return rest_ensure_response(array('status' => 'success', 'leads' => $leads));
    }

    public function setup_cors_headers() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, Origin, X-Requested-With, Accept");
    }

    public function handle_cors_preflight($value) {
        $origin = get_http_origin();
        $allowed_origin = $origin ? $origin : '*';
        header("Access-Control-Allow-Origin: $allowed_origin");
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, Origin, X-Requested-With, Accept");
        header("Access-Control-Allow-Credentials: true");
        return $value;
    }
}

// Initialize Plugin
Ajidhas_CRM_Content_Manager::get_instance();
