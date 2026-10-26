import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Color, Vector3 } from 'three';
import { useContent } from '../../context/useContent';
import './Home.css';

import heroBackground from '../../assets/abstract_architecture_hero.png';
import jaLogoModel from '../../assets/Jeeshnu logo - 3D.glb?url';

const bronze = new Color('#b47843');

function JaLogoModel({ motionEnabled }) {
    const { scene } = useGLTF(jaLogoModel);
    const { object, scale, offset } = useMemo(() => {
        const object = scene.clone(true);
        object.traverse((child) => {
            if (!child.isMesh) return;
            child.material = Array.isArray(child.material)
                ? child.material.map((material) => material.clone())
                : child.material.clone();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => {
                if (material.color) material.color.lerp(bronze, 0.4);
                if ('metalness' in material) material.metalness = Math.min(material.metalness, 0.62);
                if ('roughness' in material) material.roughness = Math.max(material.roughness, 0.2);
            });
        });
        const bounds = new Box3().setFromObject(object);
        const center = bounds.getCenter(new Vector3());
        const size = bounds.getSize(new Vector3());
        const scale = 1.65 / Math.max(size.x, size.y, size.z, 0.001);
        return { object, scale, offset: center.multiplyScalar(-scale).toArray() };
    }, [scene]);
    const rotatingGroup = useRef(null);

    useFrame((_, delta) => {
        if (motionEnabled && rotatingGroup.current) {
            rotatingGroup.current.rotation.y += delta * 0.7;
        }
    });

    return (
        <group ref={rotatingGroup}>
            {/* The GLB is authored in the XZ plane with its thin axis on Y. Turn
                that face toward the camera while keeping world Y as the spin axis. */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <primitive object={object} scale={scale} position={offset} />
            </group>
        </group>
    );
}

useGLTF.preload(jaLogoModel);

const Home = () => {
    const { getText } = useContent();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuToggleRef = useRef(null);
    const firstMenuLinkRef = useRef(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ));
    // The approved homepage image takes precedence over any older CMS bg_image value.
    const currentBg = heroBackground;
    const heroTitle = getText('home', 'hero_title', 'Ajidhas and Associates');
    const heroSubtitle = getText('home', 'hero_subtitle', 'Art and Architecture Studio');
    const artBtnText = getText('home', 'art_button_text', 'Art');
    const archBtnText = getText('home', 'architecture_button_text', 'Architecture');
    const brandParts = String(heroTitle).split(/\s+(?:and|&)\s+/i);
    const brandName = brandParts[0] || 'Ajidhas';
    const associates = brandParts[1] || 'Associates';

    useEffect(() => {
        const menuToggle = menuToggleRef.current;
        if (!menuOpen) return undefined;

        firstMenuLinkRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            menuToggle?.focus();
        };
    }, [menuOpen]);

    useEffect(() => {
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handleMotionPreference = (event) => setPrefersReducedMotion(event.matches);

        motionPreference.addEventListener('change', handleMotionPreference);
        return () => motionPreference.removeEventListener('change', handleMotionPreference);
    }, []);

    const goTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="studio-home">
            <div className="studio-home__background" aria-hidden="true">
                <img src={currentBg} alt="" />
                <div className="studio-home__shade" />
            </div>

            <header className="studio-header">
                <Link className="studio-header__brand" to="/" aria-label="Ajidhas Associates home">
                    <span>AJIDHAS</span>
                    <span>ASSOCIATES</span>
                </Link>
            </header>

            <nav className="studio-header__links" aria-label="Main navigation">
                <button
                    type="button"
                    ref={menuToggleRef}
                    className={`studio-menu-toggle${menuOpen ? ' is-open' : ''}`}
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                    aria-expanded={menuOpen}
                    aria-controls="studio-slide-menu"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </nav>

            <main className="studio-hero">
                <section className="studio-hero__identity" aria-label={`${brandName} ${associates}`}>
                    <div className="hero-emblem-media" aria-hidden="true">
                        <Canvas
                            className="hero-emblem-canvas"
                            camera={{ position: [0, 0, 3.35], fov: 35 }}
                            dpr={[1, 1.75]}
                            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                            frameloop={prefersReducedMotion ? 'demand' : 'always'}
                        >
                            <ambientLight intensity={1.25} />
                            <directionalLight color="#fff1dc" intensity={3.2} position={[-2.5, 3.5, 4]} />
                            <directionalLight color="#d28a4e" intensity={2} position={[3, 1.5, -2]} />
                            <pointLight color="#ffe1bc" intensity={12} position={[0, 1.8, 2.5]} />
                            <Suspense fallback={null}>
                                <JaLogoModel motionEnabled={!prefersReducedMotion} />
                            </Suspense>
                        </Canvas>
                    </div>

                    <div className="hero-wordmark">
                        <h1>{brandName}</h1>
                        <p className="hero-associates">{associates}</p>
                    </div>

                    <span className="hero-divider" aria-hidden="true" />
                    <p className="hero-subtitle">{heroSubtitle}</p>

                    <div className="hero-actions">
                        <button className="hero-action" type="button" onClick={() => goTo('/art')}>
                            <span>{artBtnText}</span>
                            <span className="hero-action__arrow" aria-hidden="true">&#8594;</span>
                        </button>
                        <button className="hero-action" type="button" onClick={() => goTo('/architecture')}>
                            <span>{archBtnText}</span>
                            <span className="hero-action__arrow" aria-hidden="true">&#8594;</span>
                        </button>
                    </div>
                </section>
            </main>

            <button
                type="button"
                className={`studio-menu-backdrop${menuOpen ? ' is-visible' : ''}`}
                aria-label="Close navigation menu"
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => setMenuOpen(false)}
            />
            <nav
                id="studio-slide-menu"
                className={`studio-slide-menu${menuOpen ? ' is-open' : ''}`}
                aria-label="Expanded navigation"
                aria-hidden={!menuOpen}
                inert={!menuOpen}
            >
                <p className="studio-slide-menu__eyebrow">AJIDHAS ASSOCIATES</p>
                <p className="studio-slide-menu__heading">Explore the studio</p>
                <button ref={firstMenuLinkRef} type="button" onClick={() => goTo('/architecture/projects')}>Work <span>&#8599;</span></button>
                <button type="button" onClick={() => goTo('/architecture/about')}>About <span>&#8599;</span></button>
                <button type="button" onClick={() => goTo('/contact')}>Contact <span>&#8599;</span></button>
                <p className="studio-slide-menu__footer">Art and architecture, thoughtfully made.</p>
            </nav>
        </div>
    );
};

export default Home;
