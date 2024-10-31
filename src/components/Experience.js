import React from 'react';
import Slider from 'react-slick';
import '../styles/Experience.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Matthew from '../assets/images/elementor/matthewhussey.png';
import Shunnarah from '../assets/images/elementor/Shunnarah.png';
import Secure from '../assets/images/elementor/Secure-Visa.png';
import Chris from '../assets/images/elementor/Chris-Dreyer.png';
import KJC from '../assets/images/elementor/KJC-Law-Firm.png';
import Bella from '../assets/images/elementor/Bella-Solanot.png';
import PIM from '../assets/images/elementor/PIM-Podcast.png';
import Lou from '../assets/images/elementor/Lou-Corleto.png';
import Sabrish from '../assets/images/elementor/Sabrish-Chand.png';
import Sandeep from '../assets/images/elementor/Sandeep-Anand.png';
import Harpal from '../assets/images/elementor/Harpal.png';
import Hemmat from '../assets/images/acf/Hemmat.png';
import Grossman from '../assets/images/acf/Grossman.png';
import Dehoyos from '../assets/images/acf/Dehoyos.png';
import GreenAU from '../assets/images/acf/Green Nature AU.png';
import GreenNZ from '../assets/images/acf/Green Nature NZ.png';

const Experience = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const demoImagesElementor = [
    { src: Matthew, url: "https://matthewhussey.com/", text: "MatthewHussey" },
    { src: Shunnarah, url: "https://shunnarah.com/", text: "Shunnarah" },
    { src: Secure, url: "https://www.securevisa.com/", text: "Secure Visa" },
    { src: Chris, url: "https://chrisdreyer.co/", text: "Chris Dreyer" },
    { src: KJC, url: "https://www.kjclawfirm.com/", text: "KJC Law Firm" },
    { src: Bella, url: "https://www.bellasolanot.com/", text: "Bella Solanot" },
    { src: PIM, url: "https://rankings.io/pim", text: "Rankings" },
    { src: Lou, url: "https://www.loucorleto.com/", text: "Lou Corleto" },
    { src: Sabrish, url: "https://sabrishchand.com/", text: "Sabrish Chandrakanth " },
    { src: Sandeep, url: "https://www.sandeepanand.com/", text: "Sandeep" },
    { src: Harpal, url: "https://upperlimbspecialist.co.uk/", text: "Harpal" },
  ];

  const demoImagesACF = [
    { src: Hemmat, url: "https://hemmatlaw.com/", text: "Hemmat Law Group" },
    { src: Grossman, url: "https://www.grossmanyoung.com/", text: "Grossman Young and Hammond" },
    { src: Dehoyos, url: "https://www.dehoyosinjury.com/", text: "Dehoyos Accident Attorneys" },
    { src: GreenAU, url: "https://greenbynature.com.au/", text: "Green by Nature AU" },
    { src: GreenNZ, url: "https://greenbynature.co.nz/", text: "Green by Nature NZ" },
  ];

  return (
    <div className="experience-container">
      <h2>WordPress + <span>Elementor</span></h2>
      <Slider {...settings}>
        {demoImagesElementor.map((image, index) => (
          <div key={index}>
            <a href={image.url} target="_blank" rel="noopener noreferrer">
              <img src={image.src} alt={`Demo ${index + 1}`} className="demo-image" />
            </a>
            <hr />
            <p>{image.text}</p>
          </div>
        ))}
      </Slider>
      <h2>WordPress + <span>ACF Custom Field</span></h2>
      <Slider {...settings}>
        {demoImagesACF.map((image, index) => (
          <div key={index}>
            <a href={image.url} target="_blank" rel="noopener noreferrer">
              <img src={image.src} alt={`ACF Demo ${index + 1}`} className="demo-image" />
            </a>
            <hr />
            <p>{image.text}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default Experience;
