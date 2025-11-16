// import React, { useEffect } from 'react';
// import '../styles/About.scss';
// import profileImage from '../assets/images/profile.png';

// const About = () => {
//   useEffect(() => {
//     const progressBars = document.querySelectorAll('.progress-bar .progress');
//     progressBars.forEach((bar) => {
//       const width = bar.getAttribute('data-width');
//       bar.style.width = 0;
//       setTimeout(() => {
//         bar.style.width = `${width}%`;
//       }, 100);
//     });
//   }, []);

//   return (
//     <div className="about-container">
//       <div className="left-column">
//         <img src={profileImage} alt="Profile" className="profile-image" />
//         <div className="skills">
//           <div className="skill">
//             <h3>Frontend</h3>
//             <div className="progress-bar">
//               <div className="progress" data-width="96" style={{ backgroundColor: 'orange' }}>96%</div>
//             </div>
//           </div>
//           <div className="skill">
//             <h3>Backend</h3>
//             <div className="progress-bar">
//               <div className="progress" data-width="87" style={{ backgroundColor: 'blue' }}>87%</div>
//             </div>
//           </div>
//           <div className="skill">
//             <h3>jQuery</h3>
//             <div className="progress-bar">
//               <div className="progress" data-width="85" style={{ backgroundColor: 'yellow' }}>85%</div>
//             </div>
//           </div>
//           <div className="skill">
//             <h3>PHP</h3>
//             <div className="progress-bar">
//               <div className="progress" data-width="70" style={{ backgroundColor: 'purple' }}>70%</div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="right-column">
//         <h2>About <span>Me</span></h2>
//         <p>Hi, I'm Topz, a Front-End Developer based in Iloilo City, Philippines. I love bringing designs to life by building responsive, user-friendly websites that are both visually appealing and technically sound. I'm committed to continuous learning, staying current with the latest web development trends. I also value collaboration, actively engaging with developer communities and trainings to learn from others and share my knowledge.</p>
//         <p>Work-life balance is crucial for developers, as we often spend long hours immersed in problem-solving and coding. To recharge and maintain a healthy mindset, I find solace in activities like playing video games or spending quality time with family and friends.</p>
//         <div className="study-name">
//           <div className="exp-item">
//             <div className="exp-inner">
//               <div className="exp-title">Front End Developer | Web Designer</div>
//               <div className="exp-off">Virtuosomaster | Front End Developer | Web Designer | Iloilo Philippines</div>
//               <div className="exp-date">August 2020 – August 2021</div>
//               <div className="exp-list">
//                 <ul>
//                   <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
//                   <li>Wordpress theme development</li>
//                   <li>Produce responsive website with 3 or more breakpoints</li>
//                   <li>Ensure website browser compatibility</li>
//                 </ul>
//               </div>
//             </div>
//             <div className="exp-inner">
//               <div className="exp-title">Front End Developer</div>
//               <div className="exp-off">Pixel Builder | Front End Developer | Iloilo Philippines</div>
//               <div className="exp-date">August 2021 – May 2022</div>
//               <div className="exp-list">
//                 <ul>
//                   <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
//                   <li>Wordpress theme development</li>
//                   <li>Produce responsive website with 3 or more breakpoints</li>
//                   <li>Ensure website browser compatibility</li>
//                   <li>Using ACF custom field to be dynamic</li>
//                   <li>Updating Plugin</li>
//                   <li>Using Elementor Plugin</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//           <div className="exp-item">
//             <div className="exp-inner">
//               <div className="exp-title">Front End Developer</div>
//                 <div className="exp-off">Sonnet Digital | Front End Web Developer | Manila, Philippines</div>
//                 <div className="exp-date">June 2022 - October 2024</div>
//                 <div className="exp-list">
//                   <ul>
//                     <li>Conversion of PSD web design to HTML (100+ Conversions)</li>
//                     <li>Wordpress theme development</li>
//                     <li>Produce responsive website with 3 or more breakpoints</li>
//                     <li>Ensure website browser compatibility</li>
//                     <li>Using ACF custom field to be dynamic</li>
//                     <li>Updating Plugin</li>
//                     <li>Using Elementor Plugin</li>
//                     <li>SEO Implementation</li>
//                     <li>Shadow to Senior developers work</li>
//                   </ul>
//                 </div>
//             </div>
//             <div className="exp-inner">
//               <div className="exp-title">Web Developer</div>
//               <div className="exp-off">Online Marketing Gurus | Web Developer</div>
//               <div className="exp-date">November 2024 - May 2025 </div>
//               <div className="exp-list">
//                 <ul>
//                   <li>Rebuilt the Online Marketing Gurus website</li>
//                   <li>Implemented SEO best practices</li>
//                   <li>Used ACF custom fields and ReactJS to create dynamic content</li>
//                   <li>Ensured website compatibility across major browsers</li>
//                   <li>Added canonical, prev, and next tags to all taxonomy pages</li>
//                   <li>Implemented various dynamic schema types</li>
//                   <li>Updated plugins</li>
//                   <li>Worked with Pantheon, Ubuntu, and Lando environments</li>
//                   <li>Migrated hosting from Pantheon to SiteGround</li>
//                   <li>Created a custom theme using HTML, CSS, and JavaScript</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default About;
