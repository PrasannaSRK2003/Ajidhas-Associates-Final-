import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { useContent } from '../../context/useContent';
import './Home.css';

import jaLogoModel from '../../assets/Jeeshnu logo - 3D.glb?url';

const LOGO_ROTATION_SPEED = 1.2; // radians per second

function JaLogoModel({ motionEnabled }) {
    const { scene } = useGLTF(jaLogoModel);
    const rotatingGroup = useRef(null);
    const { object, scale, offset } = useMemo(() => {
        const object = scene.clone(true);
        object.traverse((child) => {
            if (!child.isMesh) return;
            child.material = Array.isArray(child.material)
                ? child.material.map((material) => material.clone())
                : child.material.clone();
        });
        const bounds = new Box3().setFromObject(object);
        const center = bounds.getCenter(new Vector3());
        const size = bounds.getSize(new Vector3());
        const scale = 1.65 / Math.max(size.x, size.y, size.z, 0.001);
        return { object, scale, offset: center.multiplyScalar(-scale).toArray() };
    }, [scene]);

    useEffect(() => () => {
        object.traverse((child) => {
            if (!child.isMesh) return;
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material) => material.dispose());
        });
    }, [object]);

    useFrame((_, delta) => {
        if (!motionEnabled || !rotatingGroup.current) return;

        rotatingGroup.current.rotation.y = (
            rotatingGroup.current.rotation.y + delta * LOGO_ROTATION_SPEED
        ) % (Math.PI * 2);
    });

    return (
        <group ref={rotatingGroup}>
            {/* This GLB's face is authored in the XZ plane, with its thin axis on Y. */}
            <group rotation={[Math.PI / 2, 0, 0]}>
                <primitive object={object} scale={scale} position={offset} dispose={null} />
            </group>
        </group>
    );
}

useGLTF.preload(jaLogoModel);

class LogoErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error('Unable to load the homepage 3D logo:', error);
    }

    render() {
        return this.state.hasError ? null : this.props.children;
    }
}

const Home = () => {
    const { getText } = useContent();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuToggleRef = useRef(null);
    const firstMenuLinkRef = useRef(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ));
    const currentBg = '/images/home-architectural-background.png';
    const heroTitle = getText('home', 'hero_title', 'Ajidhas and Associates');
    const heroSubtitle = getText('home', 'hero_subtitle', 'Architecture & Art Studio');
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
            </div>

            <header className="studio-header">
                <Link className="studio-header__brand" to="/" aria-label="Ajidhas Associates home">
                    <span>INDEX 01 / STUDIO</span>
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
                        <LogoErrorBoundary>
                            <Canvas
                                className="hero-emblem-canvas"
                                camera={{ position: [0, 0, 3.35], fov: 35 }}
                                dpr={[1, 1.5]}
                                gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
                                frameloop={prefersReducedMotion ? 'demand' : 'always'}
                            >
                                <ambientLight intensity={1.05} />
                                <directionalLight color="#f5f2ed" intensity={1.6} position={[-2.5, 3.5, 4]} />
                                <directionalLight color="#e8d9c8" intensity={0.65} position={[3, 1.5, -2]} />
                                <Suspense fallback={null}>
                                    <LogoErrorBoundary>
                                        <JaLogoModel motionEnabled={!prefersReducedMotion} />
                                    </LogoErrorBoundary>
                                </Suspense>
                            </Canvas>
                        </LogoErrorBoundary>
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
