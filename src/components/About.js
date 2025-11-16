import React, { useEffect } from 'react';
import '../styles/About.scss';
import profileImage from '../assets/images/profile.png';


const About = () => {
  return (
    <div className="about-container">
        <div className="about-content">
        <h2>About <span>Me</span></h2>
        <p>Hi, I'm Topz, a Front-End Developer based in Iloilo City, Philippines. I love bringing designs to life by building responsive, user-friendly websites that are both visually appealing and technically sound. I'm committed to continuous learning, staying current with the latest web development trends. I also value collaboration, actively engaging with developer communities and trainings to learn from others and share my knowledge.</p>
        <p>Work-life balance is crucial for developers, as we often spend long hours immersed in problem-solving and coding. To recharge and maintain a healthy mindset, I find solace in activities like playing video games or spending quality time with family and friends.</p>
        
        </div>
        

    </div>
  );
}
export default About;