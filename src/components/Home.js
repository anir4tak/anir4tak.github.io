import React from 'react';
import '../styles/Home.scss';
import hero from '../assets/images/hero-img.webp';
import banner from '../assets/images/hero-img-1.webp';

const Home = () => {
  return (
    <div className="home-container">
      <div className="banner-wrap">
        <div className="banner-content">
          <h1>Hi! <b>I'm Mark Christofher</b>, a web developer.</h1>
          <p>A passionate Web Developer that loves to convert web designs into an interactive and responsive website.</p>
          <div className="btn-hero btn"><a href="#">Contact Me</a></div>
          
        </div>
        <div className="banner-image">
        <img src={hero} alt="Logo" className="logo" />
        </div>
      </div>

    </div>
  );
}

export default Home;
