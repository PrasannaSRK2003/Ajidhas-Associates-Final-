import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import useLocoScroll from '../../hooks/useLocoScroll';
import './Layout.css';

const Layout = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const isLandscapePage = location.pathname.startsWith('/architecture/landscape');

    useLocoScroll();

    return (
        <div className="layout-wrapper">
            {!isHomePage && !isLandscapePage && <Navbar />}
            <main className="main-content">
                {children}
            </main>
            {!isHomePage && <Footer />}
        </div>
    );
};

export default Layout;
