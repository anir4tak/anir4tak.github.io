import React, { useState } from 'react';
import '../styles/Skills.scss';
import logoHTML from '../assets/images/logo_html.svg';
import logoCSS from '../assets/images/logo_css.svg';
import logoJS from '../assets/images/logo_js.svg';
import logoPHP from '../assets/images/logo_php.svg';
import logoJQ from '../assets/images/logo_jquery.svg';
import logoBS from '../assets/images/logo_bootstrap.svg';
import logoSASS from '../assets/images/logo_sass.svg';
import logoNJS from '../assets/images/logo_node.svg';
import logoWP from '../assets/images/logo_wp.svg';
import logoGIT from '../assets/images/logo_git.svg';
import logoGITHUB from '../assets/images/logo_github.svg';
import logoFIGMA from '../assets/images/logo_figma.svg';
import logoPS from '../assets/images/logo_ps.svg';
import logoXD from '../assets/images/logo_xd.svg';
import logoBN from '../assets/images/logo_bitbucket_new.svg';


const Skills = () => {
  const [activeTab, setActiveTab] = useState('TechStack');

  const renderContent = () => {
    switch (activeTab) {
      case 'TechStack':
        return (
          <div className="grid-container">
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoHTML} alt="HTML" />
                <p>HTML</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoCSS} alt="CSS" />
                <p>CSS</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoJS} alt="JavaScript" />
                <p>JavaScript</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoPHP} alt="PHP" />
                <p>PHP</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoBS} alt="Bootstrap" />
                <p>Bootstrap</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoJQ} alt="jQuery" />
                <p>jQuery</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoSASS} alt="SASS" />
                <p>SASS</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoNJS} alt="NodeJS" />
                <p>NodeJS</p>
              </div>
            </div>
          </div>
        );
      case 'Platform':
        return (
          <div className="grid-container">
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoWP} alt="WordPress" className="single-image" />
                <p>WordPress</p>
              </div>
            </div>
          </div>
        );
      case 'Tools':
        return (
          <div className="grid-container">
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoGIT} alt="Git" />
                <p>Git</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoGITHUB} alt="GitHub" />
                <p>GitHub</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoPS} alt="Photoshop" />
                <p>Photoshop</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoFIGMA} alt="Figma" />
                <p>Figma</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoXD} alt="XD" />
                <p>XD</p>
              </div>
            </div>
            <div className="skill-item">
              <div className="skill-bg">
                <img src={logoBN} alt="Bitbucket" />
                <p>Bitbucket</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="skills-container">
      <div className="tabs">
        <button className={activeTab === 'TechStack' ? 'active' : ''} onClick={() => setActiveTab('TechStack')}>Tech Stack</button>
        <button className={activeTab === 'Platform' ? 'active' : ''} onClick={() => setActiveTab('Platform')}>Platform</button>
        <button className={activeTab === 'Tools' ? 'active' : ''} onClick={() => setActiveTab('Tools')}>Tools</button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Skills;
