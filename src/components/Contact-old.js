// import React from 'react';
// import '../styles/Contact.scss';
// import emailjs from 'emailjs-com';
// import phoneIcon from '../assets/icons/phone-call.png';
// import emailIcon from '../assets/icons/envelope.png';
// import locationIcon from '../assets/icons/pin.png';
// import facebookIcon from '../assets/images/facebook.png';
// import linkedinIcon from '../assets/images/linkedin.png';
// import instagramIcon from '../assets/images/instagram.png';
// import githubIcon from '../assets/images/github.png';
// import discordIcon from '../assets/images/discord.png';

// const Contact = () => {
//   const sendEmail = (e) => {
//     e.preventDefault();
//     emailjs.sendForm(
//       process.env.REACT_APP_EMAILJS_SERVICE_ID,
//       process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
//       e.target,
//       process.env.REACT_APP_EMAILJS_USER_ID
//     ).then((result) => {
//       console.log(result.text);
//     }, (error) => {
//       console.log(error.text);
//     });
//     e.target.reset();
//   }

//   return (
//     <div className="contact-container">
//       <div className="left-column">
//         <h2>Get in <span>Touch</span></h2>
//         <form onSubmit={sendEmail}>
//           <input type="text" name="name" placeholder="Name" required />
//           <input type="email" name="email" placeholder="Email" required />
//           <input type="tel" name="phone" pattern="^\+?[0-9\s\-()]{7,15}$" placeholder="Phone" required/>
//           <textarea name="message" placeholder="Message" required></textarea>
//           <button type="submit">Submit</button>
//         </form>
//       </div>
//       <div className="right-column">
//         <h2>Contact <span>Me</span></h2>
//         <div className="contact-info">
//           <div>
//             <img src={phoneIcon} alt="Phone" className="icon" />
//             <a href="tel:+63 991 965 9170">+63 991 965 9170</a>
//           </div>
//           <div>
//             <img src={emailIcon} alt="Email" className="icon" />
//             <a href="mailto:devmarkchristofher@gmail.com">devmarkchristofher@gmail.com</a>
//           </div>
//           <div>
//             <img src={locationIcon} alt="Location" className="icon" />
//             <span>Santa Barbara, Western Visayas, Philippines</span>
//           </div>
//           <div>
//             <a href="https://www.facebook.com/christofhermark" target="_blank" rel="noopener noreferrer">
//               <img src={facebookIcon} alt="Facebook" className="icon" />
//             </a>
//             <a href="https://www.linkedin.com/in/mark-christofher/" target="_blank" rel="noopener noreferrer">
//               <img src={linkedinIcon} alt="LinkedIn" className="icon" />
//             </a>
//             <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
//               <img src={instagramIcon} alt="Instagram" className="icon" />
//             </a>
//             <a href="https://github.com/anir4tak" target="_blank" rel="noopener noreferrer">
//               <img src={githubIcon} alt="GitHub" className="icon" />
//             </a>
//             <a href="https://discordapp.com/users/776705848835309579" target="_blank" rel="noopener noreferrer">
//               <img src={discordIcon} alt="Discord" className="icon" />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Contact;
