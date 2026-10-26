import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import './Navbar.css';


const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Handle scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHomePage = location.pathname === '/';

    const handleBack = () => {
        try {
            navigate(-1);
        } catch {
            window.history.back();
        }
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="left-group">
                    {!isHomePage && (
                        <button className="back-button" onClick={handleBack} aria-label="Go back">
                            <IoArrowBack size={20} />
                        </button>
                    )}
                    <div className="logo">
                        <Link to="/">Ajidhas & Associates</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
