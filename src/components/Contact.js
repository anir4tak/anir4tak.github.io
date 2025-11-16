import React from 'react';
import '../styles/Contact.scss';
import phoneIcon from '../assets/icons/phone-call.png';
import emailIcon from '../assets/icons/envelope.png';
import locationIcon from '../assets/icons/pin.png';
import facebookIcon from '../assets/images/facebook.png';
import linkedinIcon from '../assets/images/linkedin.png';
import instagramIcon from '../assets/images/instagram.png';
import githubIcon from '../assets/images/github.png';
import discordIcon from '../assets/images/discord.png';

const Contact = () => {

  return (
    <div className="contact-container">
      <div className="contact-wrap">
        <div className="left-column">
          <h2>Contact</h2>
          <div className="contact-info">
            <div>
              <img src={phoneIcon} alt="Phone" className="icon" />
              <a href="tel:+63 991 965 9170">+63 991 965 9170</a>
            </div>
            <div>
              <img src={emailIcon} alt="Email" className="icon" />
              <a href="mailto:devmarkchristofher@gmail.com">devmarkchristofher@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="right-column">
            <div>
              <a href="https://www.facebook.com/christofhermark" target="_blank" rel="noopener noreferrer">
                <img src={facebookIcon} alt="Facebook" className="icon" />
              </a>
              <a href="https://www.linkedin.com/in/mark-christofher/" target="_blank" rel="noopener noreferrer">
                <img src={linkedinIcon} alt="LinkedIn" className="icon" />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                <img src={instagramIcon} alt="Instagram" className="icon" />
              </a>
              <a href="https://github.com/anir4tak" target="_blank" rel="noopener noreferrer">
                <img src={githubIcon} alt="GitHub" className="icon" />
              </a>
              <a href="https://discordapp.com/users/776705848835309579" target="_blank" rel="noopener noreferrer">
                <img src={discordIcon} alt="Discord" className="icon" />
              </a>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
