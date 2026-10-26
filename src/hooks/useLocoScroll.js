import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useLocoScroll = (start = true) => {
    const location = useLocation();
    const lenisRef = useRef(null);

    useEffect(() => {
        if (!start) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;
        const handleLenisScroll = () => ScrollTrigger.update();
        lenis.on('scroll', handleLenisScroll);

        let rafId;
        let isActive = true;
        const raf = (time) => {
            if (!isActive) return;
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        // Handle resize
        const handleResize = () => {
            lenis.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            isActive = false;
            cancelAnimationFrame(rafId);
            lenis.off('scroll', handleLenisScroll);
            lenis.destroy();
            lenisRef.current = null;
            window.removeEventListener('resize', handleResize);
        };
    }, [start]);

    useEffect(() => {
        lenisRef.current?.scrollTo(0, { immediate: true });
    }, [location.pathname]);
};

export default useLocoScroll;
