import React, { useState } from 'react';
import '../styles/Header.scss';
import CV from '../assets/images/Mark-Christofher-Rodriguez.pdf';
import logo from '../assets/images/Logo.png';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header>
      <nav>
        <div className="left-column">
          {/* <p>TOPZ</p> */}
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="right-column">
          <div className="menu-icon mobile-icon" onClick={toggleMenu}>
            ☰
          </div>
          {isOpen && <div className="close-icon" onClick={toggleMenu}>✖</div>}
          <ul className={isOpen ? 'nav-links nav-none open' : 'nav-links'}>
            <li><a href="#home">Home</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact Me</a></li>
            {/* <li><a href={CV} download={CV} className="cv-download">Download my CV</a></li> */}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;
