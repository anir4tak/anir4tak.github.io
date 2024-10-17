import React, { useEffect } from 'react';
import '../styles/About.scss';
import profileImage from '../assets/images/profile.png';

const About = () => {
  useEffect(() => {
    const progressBars = document.querySelectorAll('.progress-bar .progress');
    progressBars.forEach((bar) => {
      const width = bar.getAttribute('data-width');
      bar.style.width = 0;
      setTimeout(() => {
        bar.style.width = `${width}%`;
      }, 100);
    });
  }, []);

  return (
    <div className="about-container">
      <div className="left-column">
        <img src={profileImage} alt="Profile" className="profile-image" />
        <div className="skills">
          <div className="skill">
            <h3>Frontend</h3>
            <div className="progress-bar">
              <div className="progress" data-width="96" style={{ backgroundColor: 'orange' }}>96%</div>
            </div>
          </div>
          <div className="skill">
            <h3>Backend</h3>
            <div className="progress-bar">
              <div className="progress" data-width="87" style={{ backgroundColor: 'blue' }}>87%</div>
            </div>
          </div>
          <div className="skill">
            <h3>jQuery</h3>
            <div className="progress-bar">
              <div className="progress" data-width="85" style={{ backgroundColor: 'yellow' }}>85%</div>
            </div>
          </div>
          <div className="skill">
            <h3>PHP</h3>
            <div className="progress-bar">
              <div className="progress" data-width="70" style={{ backgroundColor: 'purple' }}>70%</div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-column">
        <h2>About <span>Me</span></h2>
        <p>Hi! I'm Topz from Iloilo City, Philippines. I'm full-time Front-End Developer. As a developer, I translate design into a functional and responsive website. I also ensure that it is optimized and creatively done. I'm always eager to learn and usually express it by keeping myself updated to the latest technologies. I do collaborate with other developers by joining communities and trainings so that I’ll be able to know how other developers write their codes and learn from them.</p>
        <p>Work Life Balance is very important specially on developers because most of the day, we think a lot of ways to figure out how to build things and to fix bugs. Therefore, to refresh my mind and to relax, I either play video games or spend time with my family and friends.</p>
        <div className="study-name">
          <div className="exp-item">
            <div className="exp-inner">
              <div className="exp-title">Front End Developer | Web Designer</div>
              <div className="exp-off">Virtuosomaster | Front End Developer | Web Designer | Iloilo Philippines</div>
              <div className="exp-date">August 2020 – August 2021</div>
              <div className="exp-list">
                <ul>
                  <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
                  <li>Wordpress theme development</li>
                  <li>Produce responsive website with 3 or more breakpoints</li>
                  <li>Ensure website browser compatibility</li>
                </ul>
              </div>
            </div>
            <div className="exp-inner">
              <div className="exp-title">Front End Developer</div>
              <div className="exp-off">Pixel Builder | Front End Developer | Iloilo Philippines</div>
              <div className="exp-date">August 2021 – May 2021</div>
              <div className="exp-list">
                <ul>
                  <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
                  <li>Wordpress theme development</li>
                  <li>Produce responsive website with 3 or more breakpoints</li>
                  <li>Ensure website browser compatibility</li>
                  <li>Using ACF custom field to be dynamic</li>
                  <li>Updating Plugin</li>
                  <li>Using Elementor Plugin</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="exp-item">
            <div className="exp-inner">
              <div className="exp-title">Front End Developer</div>
                <div className="exp-off">Sonnet Digital | Front End Web Developer | Manila, Philippines</div>
                <div className="exp-date">June 2022 - Presents</div>
                <div className="exp-list">
                  <ul>
                    <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
                    <li>Wordpress theme development</li>
                    <li>Produce responsive website with 3 or more breakpoints</li>
                    <li>Ensure website browser compatibility</li>
                    <li>Using ACF custom field to be dynamic</li>
                    <li>Updating Plugin</li>
                    <li>Using Elementor Plugin</li>
                    <li>SEO Maintenance</li>
                    <li>Shadow to Senior developers work</li>
                  </ul>
                </div>
            </div>
            <div className="exp-inner">
              <div className="exp-title"></div>
              <div className="exp-off"></div>
              <div className="exp-date"></div>
              <div className="exp-list">
                <ul>

                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
