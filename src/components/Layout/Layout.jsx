import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import useLocoScroll from '../../hooks/useLocoScroll';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isArtLandingPage = location.pathname === '/art';
    const isGalleryPage = location.pathname === '/art/gallery';
    const isArtistPage = location.pathname === '/art/artist';
    const isArchitectureLandingPage = location.pathname === '/architecture';

    const isLandscapePage = location.pathname.startsWith('/architecture/landscape');

    useLocoScroll();

    return (
        <div className="layout-wrapper">
            {!isHomePage && !isLandscapePage && !isArtLandingPage && !isGalleryPage && !isArtistPage && !isArchitectureLandingPage && <Navbar />}
            <main className={`main-content${isGalleryPage ? ' main-content--gallery' : ''}${isArtistPage ? ' main-content--artist' : ''}`}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;

