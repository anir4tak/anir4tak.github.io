import React, { useEffect } from 'react';
import '../styles/About.scss';
import profileImage from '../assets/images/profile.png';
import htmlLogo from '../assets/images/logo_html.svg';
import cssLogo from '../assets/images/logo_css.svg';
import jsLogo from '../assets/images/logo_js.svg';
import phpLogo from '../assets/images/logo_php.svg';

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
            <img src={htmlLogo} alt="HTML" className="skill-logo" />
            <h3>Frontend</h3>
            <div className="progress-bar">
              <div className="progress" data-width="96" style={{ backgroundColor: 'orange' }}>96%</div>
            </div>
          </div>
          <div className="skill">
            <img src={cssLogo} alt="CSS" className="skill-logo" />
            <h3>Backend</h3>
            <div className="progress-bar">
              <div className="progress" data-width="87" style={{ backgroundColor: 'blue' }}>87%</div>
            </div>
          </div>
          <div className="skill">
            <img src={jsLogo} alt="JavaScript" className="skill-logo" />
            <h3>JavaScript</h3>
            <div className="progress-bar">
              <div className="progress" data-width="85" style={{ backgroundColor: 'yellow' }}>85%</div>
            </div>
          </div>
          <div className="skill">
            <img src={phpLogo} alt="PHP" className="skill-logo" />
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
      </div>
    </div>
  );
}

export default About;
